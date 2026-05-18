<script setup>
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { animals as animalsApi } from '@/api'

const route  = useRoute()
const router = useRouter()
const animal  = ref(null)
const loading = ref(true)
const canvasRef  = ref(null)
const rendering  = ref(false)

// ── Config ────────────────────────────────────────────────────────────────────
const cfg = ref({
  width_mm:  90,
  height_mm: 54,

  bg_color:     '#1e2433',
  text_color:   '#f1f5f9',
  accent_color: '#4ade80',
  border:       true,
  border_color: '#4ade80',
  border_width: 1.5,
  corner_radius: 5,

  show_emoji:   true,
  emoji:        '🦎',
  show_name:    true,
  show_species: true,
  show_morph:   true,
  show_sex:     true,
  show_dob:     true,
  show_weight:  false,
  custom_line1: '',
  custom_line2: '',

  qr_enabled:  true,
  qr_content:  '',
  qr_position: 'right',   // 'right' | 'left'

  export_dpi: 300,
})

const SIZE_PRESETS = [
  { label: '90×54',   w: 90,  h: 54  },
  { label: '85×55',   w: 85,  h: 55  },
  { label: '50×30',   w: 50,  h: 30  },
  { label: '70×42',   w: 70,  h: 42  },
  { label: '100×60',  w: 100, h: 60  },
  { label: 'A6 quer', w: 148, h: 105 },
]

const COLOR_PRESETS = [
  { label: 'Dunkel/Grün',  bg: '#1e2433', text: '#f1f5f9', accent: '#4ade80', border: '#4ade80' },
  { label: 'Dunkel/Blau',  bg: '#1e2433', text: '#f1f5f9', accent: '#60a5fa', border: '#60a5fa' },
  { label: 'Dunkel/Orange',bg: '#1a0f00', text: '#fde68a', accent: '#f97316', border: '#f97316' },
  { label: 'Schwarz/Gold', bg: '#070707', text: '#fbbf24', accent: '#fbbf24', border: '#a16207' },
  { label: 'Weiß/Grün',   bg: '#ffffff', text: '#1e293b', accent: '#16a34a', border: '#16a34a' },
  { label: 'Weiß/Lila',   bg: '#faf5ff', text: '#1e293b', accent: '#9333ea', border: '#9333ea' },
  { label: 'Weiß/Schwarz',bg: '#ffffff', text: '#111111', accent: '#111111', border: '#374151' },
  { label: 'Natur/Braun', bg: '#fefce8', text: '#3d1f00', accent: '#854d0e', border: '#a16207' },
]

function applyColorPreset(p) {
  cfg.value.bg_color     = p.bg
  cfg.value.text_color   = p.text
  cfg.value.accent_color = p.accent
  cfg.value.border_color = p.border
}

function applySize(p) {
  cfg.value.width_mm  = p.w
  cfg.value.height_mm = p.h
}

const activeSize = computed(() =>
  SIZE_PRESETS.find(p => p.w === cfg.value.width_mm && p.h === cfg.value.height_mm)?.label ?? 'Custom'
)

// ── Canvas rendering ──────────────────────────────────────────────────────────
const MM = 25.4
function px(mm, dpi) { return (mm / MM) * dpi }

function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y,     x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x,     y + h, r)
  ctx.arcTo(x,     y + h, x,     y,     r)
  ctx.arcTo(x,     y,     x + w, y,     r)
  ctx.closePath()
}

function fitText(ctx, text, maxW) {
  if (ctx.measureText(text).width <= maxW) return text
  let t = text
  while (t.length > 0 && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1)
  return t + '…'
}

function loadImg(src) {
  return new Promise((res, rej) => {
    const img = new Image()
    img.onload  = () => res(img)
    img.onerror = rej
    img.src = src
  })
}

async function qrDataURL(text, size, dark, light) {
  try {
    const QRCode = (await import('qrcode')).default
    return await QRCode.toDataURL(text, {
      width: size, margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark, light },
    })
  } catch { return null }
}

async function draw(canvas, dpi) {
  const c = cfg.value
  const a = animal.value
  const W = Math.round(px(c.width_mm,  dpi))
  const H = Math.round(px(c.height_mm, dpi))
  canvas.width  = W
  canvas.height = H

  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, W, H)

  const S  = dpi / MM         // scale: px per mm
  const bw = c.border ? c.border_width * S : 0
  const r  = c.corner_radius * S

  // ── Background ──
  ctx.fillStyle = c.bg_color
  roundRect(ctx, 0, 0, W, H, r)
  ctx.fill()

  // ── Border ──
  if (c.border && bw > 0) {
    ctx.strokeStyle = c.border_color
    ctx.lineWidth   = bw
    roundRect(ctx, bw / 2, bw / 2, W - bw, H - bw, r)
    ctx.stroke()
  }

  // ── QR Code ──
  const PAD  = 3 * S
  const IH   = H - PAD * 2 - bw * 2
  const qrSz = c.qr_enabled ? Math.min(IH * 0.95, W * 0.36) : 0

  let qrImg = null
  if (c.qr_enabled && c.qr_content && qrSz > 10) {
    const url = await qrDataURL(c.qr_content, Math.round(qrSz), c.text_color, c.bg_color)
    if (url) qrImg = await loadImg(url)
  }

  if (qrImg) {
    const qrX = c.qr_position === 'right' ? W - PAD - bw - qrSz : bw + PAD
    const qrY = (H - qrSz) / 2
    ctx.drawImage(qrImg, qrX, qrY, qrSz, qrSz)
  }

  // ── Text column ──
  const textLeft = bw + PAD + (c.qr_enabled && c.qr_position === 'left' ? qrSz + PAD : 0)
  const textW    = W - bw * 2 - PAD * 2 - (c.qr_enabled ? qrSz + PAD : 0)
  let   ty       = bw + PAD

  // Emoji
  if (c.show_emoji && c.emoji) {
    const eSz = Math.min(S * 8, H * 0.20)
    ctx.font  = `${eSz}px serif`
    ctx.fillText(c.emoji, textLeft, ty + eSz * 0.88)
    ty += eSz + S * 1.2
  }

  // Animal name
  if (c.show_name) {
    const nSz = Math.min(S * 7, textW * 0.25, H * 0.22)
    ctx.font      = `bold ${nSz}px Arial, sans-serif`
    ctx.fillStyle = c.text_color
    ctx.fillText(fitText(ctx, a.name, textW), textLeft, ty + nSz)
    ty += nSz + S * 1
  }

  // Accent rule
  ctx.fillStyle = c.accent_color
  ctx.fillRect(textLeft, ty, textW * 0.65, Math.max(1, S * 0.5))
  ty += S * 2.5

  // Body
  const bSz = Math.max(S * 2.8, Math.min(S * 3.8, H * 0.10))

  if (c.show_species) {
    ctx.font      = `italic ${bSz}px Arial, sans-serif`
    ctx.fillStyle = c.text_color + 'bb'
    ctx.fillText(fitText(ctx, a.species, textW), textLeft, ty + bSz)
    ty += bSz + S * 1.4
  }

  ctx.font = `${bSz}px Arial, sans-serif`

  if (c.show_morph && a.morph) {
    ctx.fillStyle = c.accent_color
    ctx.fillText(fitText(ctx, a.morph, textW), textLeft, ty + bSz)
    ty += bSz + S * 1.2
  }

  ctx.fillStyle = c.text_color + 'aa'

  const lines = []
  if (c.show_sex)    lines.push(a.sex === 'male' ? '♂ Männlich' : a.sex === 'female' ? '♀ Weiblich' : '? Unbekannt')
  if (c.show_dob && a.date_of_birth) lines.push(`* ${new Date(a.date_of_birth).toLocaleDateString('de-DE')}`)
  if (c.show_weight && a.weight_g)   lines.push(`${a.weight_g} g`)
  if (c.custom_line1) lines.push(c.custom_line1)
  if (c.custom_line2) lines.push(c.custom_line2)

  for (const line of lines) {
    if (ty + bSz > H - PAD - bw) break
    ctx.fillText(fitText(ctx, line, textW), textLeft, ty + bSz)
    ty += bSz + S * 1.2
  }
}

// ── Preview ───────────────────────────────────────────────────────────────────
async function updatePreview() {
  if (!canvasRef.value || !animal.value) return
  rendering.value = true
  try {
    // Render at 2× screen DPI for crisp preview
    await draw(canvasRef.value, 96 * 2)
    // CSS scale to fit container (max 640px wide)
    const maxW  = Math.min(640, window.innerWidth - 80)
    const scale = Math.min(1, maxW / (canvasRef.value.width / 2))
    canvasRef.value.style.width  = `${(canvasRef.value.width  / 2) * scale}px`
    canvasRef.value.style.height = `${(canvasRef.value.height / 2) * scale}px`
  } finally {
    rendering.value = false
  }
}

// ── Export ────────────────────────────────────────────────────────────────────
async function downloadPNG() {
  if (!animal.value) return
  const off = document.createElement('canvas')
  await draw(off, cfg.value.export_dpi)
  const a = document.createElement('a')
  a.download = `${animal.value.name.replace(/\s+/g, '_')}_schild_${cfg.value.width_mm}x${cfg.value.height_mm}mm.png`
  a.href = off.toDataURL('image/png')
  a.click()
}

function printLabel() {
  if (!canvasRef.value) return
  // Re-render at 300dpi for printing into a temporary window
  const off = document.createElement('canvas')
  draw(off, 300).then(() => {
    const mmW = cfg.value.width_mm
    const mmH = cfg.value.height_mm
    const win = window.open('', '_blank', 'width=800,height=600')
    win.document.write(`<!DOCTYPE html>
<html><head><title>Schild – ${animal.value.name}</title>
<style>
  @page { size: ${mmW}mm ${mmH}mm; margin: 0; }
  body  { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #fff; }
  img   { width: ${mmW}mm; height: ${mmH}mm; }
</style></head><body>
  <img src="${off.toDataURL('image/png')}" />
  <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),500)}<\/script>
</body></html>`)
    win.document.close()
  })
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  const res = await animalsApi.get(route.params.id)
  animal.value = res.data
  cfg.value.qr_content = `${window.location.origin}/animals/${res.data.id}`
  loading.value = false
  await nextTick()
  await updatePreview()
})

watch(cfg, updatePreview, { deep: true })

// Pixel size info for display
const exportSize = computed(() => {
  const w = Math.round(px(cfg.value.width_mm,  cfg.value.export_dpi))
  const h = Math.round(px(cfg.value.height_mm, cfg.value.export_dpi))
  return `${w}×${h}px`
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6 flex-wrap">
      <button class="btn-secondary btn-sm" @click="router.back()">← Zurück</button>
      <h1 class="text-2xl font-bold text-slate-200">Schild / Label</h1>
      <span v-if="animal" class="text-slate-500">für <span class="text-slate-300">{{ animal.name }}</span></span>
    </div>

    <div v-if="loading" class="text-slate-500 text-center py-16">Lade…</div>

    <div v-else class="grid xl:grid-cols-[1fr_380px] gap-6 items-start">

      <!-- ── Preview pane ── -->
      <div class="card">
        <h2 class="font-semibold text-slate-300 mb-4">Vorschau</h2>

        <!-- Canvas stage -->
        <div class="bg-[#080808] rounded-xl p-6 flex items-center justify-center min-h-[180px] relative">
          <div v-if="rendering" class="absolute inset-0 flex items-center justify-center text-slate-600 text-sm">
            Rendern…
          </div>
          <canvas ref="canvasRef" class="rounded shadow-2xl block" />
        </div>

        <!-- Dimension info -->
        <p class="text-center text-xs text-slate-600 mt-3">
          {{ cfg.width_mm }}×{{ cfg.height_mm }} mm · {{ cfg.export_dpi }} dpi · {{ exportSize }}
        </p>

        <!-- Action buttons -->
        <div class="flex gap-3 mt-4 justify-center flex-wrap">
          <button class="btn-primary" @click="downloadPNG">
            ⬇ PNG herunterladen
          </button>
          <button class="btn-secondary" @click="printLabel">
            🖨 Drucken
          </button>
        </div>

        <!-- Export DPI -->
        <div class="mt-4 flex items-center gap-3 justify-center">
          <span class="text-xs text-slate-500">Export-Auflösung:</span>
          <select v-model.number="cfg.export_dpi" class="w-40 text-sm py-1">
            <option :value="150">150 dpi (Vorschau)</option>
            <option :value="300">300 dpi (Druck)</option>
            <option :value="600">600 dpi (Profi)</option>
          </select>
        </div>
      </div>

      <!-- ── Config pane ── -->
      <div class="space-y-4">

        <!-- Size -->
        <div class="card">
          <h3 class="cfg-heading">📐 Größe</h3>
          <div class="flex flex-wrap gap-1.5 mb-3">
            <button
              v-for="p in SIZE_PRESETS" :key="p.label"
              class="btn-secondary btn-sm text-xs"
              :class="activeSize === p.label ? '!border-brand-500 !text-brand-400' : ''"
              @click="applySize(p)">
              {{ p.label }}
            </button>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label>Breite (mm)</label>
              <input type="number" v-model.number="cfg.width_mm"  min="20" max="500" />
            </div>
            <div>
              <label>Höhe (mm)</label>
              <input type="number" v-model.number="cfg.height_mm" min="10" max="500" />
            </div>
          </div>
        </div>

        <!-- Colors -->
        <div class="card">
          <h3 class="cfg-heading">🎨 Farben</h3>
          <div class="flex flex-wrap gap-1.5 mb-3">
            <button
              v-for="p in COLOR_PRESETS" :key="p.label"
              class="px-2 py-1 rounded text-xs border-2 font-medium transition-all"
              :style="{ background: p.bg, color: p.text, borderColor: p.accent }"
              @click="applyColorPreset(p)">
              {{ p.label }}
            </button>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label>Hintergrund</label>
              <div class="flex gap-2">
                <input type="color" v-model="cfg.bg_color"     class="color-swatch" />
                <input v-model="cfg.bg_color" class="flex-1 text-xs" />
              </div>
            </div>
            <div>
              <label>Text</label>
              <div class="flex gap-2">
                <input type="color" v-model="cfg.text_color"   class="color-swatch" />
                <input v-model="cfg.text_color" class="flex-1 text-xs" />
              </div>
            </div>
            <div>
              <label>Akzentfarbe</label>
              <div class="flex gap-2">
                <input type="color" v-model="cfg.accent_color" class="color-swatch" />
                <input v-model="cfg.accent_color" class="flex-1 text-xs" />
              </div>
            </div>
            <div>
              <label class="flex items-center gap-2">
                <input type="checkbox" v-model="cfg.border" class="w-3.5 h-3.5" />
                Rahmen
              </label>
              <div class="flex gap-2 mt-1">
                <input type="color" v-model="cfg.border_color" class="color-swatch" :disabled="!cfg.border" />
                <input type="number" v-model.number="cfg.border_width" min="0.5" max="5" step="0.5"
                       class="flex-1 text-xs" :disabled="!cfg.border" placeholder="mm" />
              </div>
            </div>
          </div>
          <div class="mt-3">
            <label>Eckenradius: {{ cfg.corner_radius }} mm</label>
            <input type="range" v-model.number="cfg.corner_radius" min="0" max="20" step="0.5"
                   class="w-full accent-green-500" />
          </div>
        </div>

        <!-- Content fields -->
        <div class="card">
          <h3 class="cfg-heading">📝 Inhalt</h3>

          <!-- Emoji -->
          <div class="flex items-center gap-3 mb-3">
            <input type="checkbox" v-model="cfg.show_emoji" class="w-4 h-4 flex-shrink-0" />
            <label class="mb-0 text-sm">Icon / Emoji</label>
            <input v-model="cfg.emoji" :disabled="!cfg.show_emoji"
                   class="w-16 text-center text-xl px-1 py-0" />
          </div>

          <!-- Checkboxes -->
          <div class="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-4">
            <label v-for="[key, label] in [
              ['show_name',    'Name'],
              ['show_species', 'Wissensch. Name'],
              ['show_morph',   'Morph / Farbform'],
              ['show_sex',     'Geschlecht'],
              ['show_dob',     'Geburtsdatum'],
              ['show_weight',  'Gewicht'],
            ]" :key="key" class="flex items-center gap-2 text-sm cursor-pointer mb-0">
              <input type="checkbox" v-model="cfg[key]" class="w-3.5 h-3.5" />
              {{ label }}
            </label>
          </div>

          <div class="space-y-2">
            <div>
              <label>Eigene Zeile 1</label>
              <input v-model="cfg.custom_line1" placeholder="z.B. Züchter: Max Mustermann" />
            </div>
            <div>
              <label>Eigene Zeile 2</label>
              <input v-model="cfg.custom_line2" placeholder="z.B. Saison 2025" />
            </div>
          </div>
        </div>

        <!-- QR Code -->
        <div class="card">
          <div class="flex items-center justify-between mb-3">
            <h3 class="cfg-heading !mb-0">📷 QR-Code</h3>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="cfg.qr_enabled" class="w-4 h-4" />
              <span class="text-sm">Aktiv</span>
            </label>
          </div>
          <div v-if="cfg.qr_enabled" class="space-y-2">
            <div>
              <label>Inhalt (URL oder Text)</label>
              <input v-model="cfg.qr_content" placeholder="https://…" />
            </div>
            <div>
              <label>Position</label>
              <div class="flex gap-2">
                <button
                  v-for="pos in [['right','Rechts'], ['left','Links']]" :key="pos[0]"
                  class="btn-secondary btn-sm flex-1 text-sm"
                  :class="cfg.qr_position === pos[0] ? '!border-brand-500 !text-brand-400' : ''"
                  @click="cfg.qr_position = pos[0]">
                  {{ pos[1] }}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div><!-- end config pane -->
    </div>
  </div>
</template>

<style scoped>
.cfg-heading {
  @apply text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3;
}
.color-swatch {
  @apply w-10 h-9 p-0.5 rounded cursor-pointer flex-shrink-0 border-0 bg-transparent;
}
</style>
