<script setup>
import { ref, onMounted } from 'vue'
import { breeding as breedingApi, animals as animalsApi } from '@/api'

const list = ref([])
const allAnimals = ref([])
const loading = ref(true)
const showForm = ref(false)
const saving = ref(false)
const editId = ref(null)
const form = ref({
  female_id: '', male_id: '',
  date_paired: '', date_separated: '',
  copulation_observed: false,
  date_eggs_or_birth: '',
  clutch_size: '', fertile_count: '',
  success: null, notes: ''
})

onMounted(async () => {
  const [bRes, aRes] = await Promise.all([
    breedingApi.list({ limit: 200 }),
    animalsApi.list({ active_only: false, limit: 500 })
  ])
  list.value = bRes.data
  allAnimals.value = aRes.data
  loading.value = false
})

function resetForm() {
  form.value = { female_id: '', male_id: '', date_paired: '', date_separated: '', copulation_observed: false, date_eggs_or_birth: '', clutch_size: '', fertile_count: '', success: null, notes: '' }
  editId.value = null
  showForm.value = false
}

async function save() {
  saving.value = true
  try {
    const payload = { ...form.value, female_id: parseInt(form.value.female_id), male_id: parseInt(form.value.male_id) }
    if (!payload.date_paired) payload.date_paired = null
    if (!payload.date_separated) payload.date_separated = null
    if (!payload.date_eggs_or_birth) payload.date_eggs_or_birth = null
    if (!payload.clutch_size) payload.clutch_size = null
    if (!payload.fertile_count) payload.fertile_count = null

    if (editId.value) {
      const res = await breedingApi.update(editId.value, payload)
      const idx = list.value.findIndex(e => e.id === editId.value)
      if (idx !== -1) list.value[idx] = res.data
    } else {
      const res = await breedingApi.create(payload)
      list.value.unshift(res.data)
    }
    resetForm()
  } finally {
    saving.value = false
  }
}

function edit(event) {
  editId.value = event.id
  form.value = {
    female_id: event.female_id,
    male_id: event.male_id,
    date_paired: event.date_paired ?? '',
    date_separated: event.date_separated ?? '',
    copulation_observed: event.copulation_observed,
    date_eggs_or_birth: event.date_eggs_or_birth ?? '',
    clutch_size: event.clutch_size ?? '',
    fertile_count: event.fertile_count ?? '',
    success: event.success,
    notes: event.notes ?? ''
  }
  showForm.value = true
}

async function remove(id) {
  if (!confirm('Zuchtereignis löschen?')) return
  await breedingApi.delete(id)
  list.value = list.value.filter(e => e.id !== id)
}

function fmtDate(d) { return d ? new Date(d).toLocaleDateString('de-DE') : '—' }

const females = () => allAnimals.value.filter(a => a.sex !== 'male')
const males   = () => allAnimals.value.filter(a => a.sex !== 'female')
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold text-slate-200">Zucht</h1>
      <button class="btn-primary btn-sm" @click="showForm = !showForm; if(!showForm) resetForm()">
        {{ showForm ? '✕ Abbrechen' : '+ Zuchtereignis' }}
      </button>
    </div>

    <!-- Form -->
    <div v-if="showForm" class="card mb-6">
      <h3 class="font-medium text-slate-200 mb-4">{{ editId ? 'Zuchtereignis bearbeiten' : 'Neues Zuchtereignis' }}</h3>
      <form @submit.prevent="save" class="grid sm:grid-cols-2 gap-4">
        <div>
          <label>Weibchen ♀ *</label>
          <select v-model="form.female_id" required>
            <option value="">Wählen…</option>
            <option v-for="a in females()" :key="a.id" :value="a.id">{{ a.name }} – {{ a.morph ?? a.species }}</option>
          </select>
        </div>
        <div>
          <label>Männchen ♂ *</label>
          <select v-model="form.male_id" required>
            <option value="">Wählen…</option>
            <option v-for="a in males()" :key="a.id" :value="a.id">{{ a.name }} – {{ a.morph ?? a.species }}</option>
          </select>
        </div>
        <div><label>Zusammengesetzt am</label><input type="date" v-model="form.date_paired" /></div>
        <div><label>Getrennt am</label><input type="date" v-model="form.date_separated" /></div>
        <div class="flex items-end pb-2">
          <label class="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" v-model="form.copulation_observed" class="w-4 h-4" />
            Kopulation beobachtet
          </label>
        </div>
        <div><label>Eiablage / Geburt am</label><input type="date" v-model="form.date_eggs_or_birth" /></div>
        <div><label>Gelege-/Wurfgröße</label><input type="number" v-model="form.clutch_size" min="0" placeholder="8" /></div>
        <div><label>Davon fertil / lebendig</label><input type="number" v-model="form.fertile_count" min="0" /></div>
        <div>
          <label>Ergebnis</label>
          <select v-model="form.success">
            <option :value="null">Noch offen</option>
            <option :value="true">Erfolgreich</option>
            <option :value="false">Nicht erfolgreich</option>
          </select>
        </div>
        <div class="sm:col-span-2"><label>Notizen</label><textarea v-model="form.notes" rows="2" /></div>
        <div class="sm:col-span-2 flex gap-2">
          <button type="submit" class="btn-primary btn-sm" :disabled="saving">
            {{ saving ? 'Speichern…' : editId ? 'Aktualisieren' : 'Anlegen' }}
          </button>
          <button type="button" class="btn-secondary btn-sm" @click="resetForm">Abbrechen</button>
        </div>
      </form>
    </div>

    <!-- List -->
    <div v-if="loading" class="text-slate-500 text-center py-16">Lade…</div>
    <div v-else-if="!list.length" class="text-center py-16 text-slate-500">
      <div class="text-4xl mb-3">🥚</div>
      <p>Noch keine Zuchtereignisse</p>
    </div>
    <div v-else class="space-y-3">
      <div v-for="e in list" :key="e.id" class="card">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div class="flex items-center gap-3 flex-wrap">
              <span class="font-semibold text-slate-200">
                <span class="text-pink-400">♀ {{ e.female.name }}</span>
                <span class="text-slate-500 mx-2">×</span>
                <span class="text-blue-400">♂ {{ e.male.name }}</span>
              </span>
              <span v-if="e.success === true" class="badge-green">Erfolgreich</span>
              <span v-else-if="e.success === false" class="badge-red">Nicht erfolgreich</span>
              <span v-else class="badge-gray">Offen</span>
            </div>
            <div class="text-xs text-slate-500 mt-1 flex flex-wrap gap-3">
              <span v-if="e.female.morph" class="text-pink-300/60">{{ e.female.morph }}</span>
              <span v-if="e.male.morph" class="text-blue-300/60">{{ e.male.morph }}</span>
            </div>
          </div>
          <div class="flex gap-2">
            <button class="btn-secondary btn-sm text-xs" @click="edit(e)">✏️</button>
            <button class="btn-danger btn-sm text-xs" @click="remove(e.id)">🗑</button>
          </div>
        </div>

        <div class="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span class="text-slate-500">Zusammengesetzt</span>
            <div class="text-slate-300">{{ fmtDate(e.date_paired) }}</div>
          </div>
          <div>
            <span class="text-slate-500">Getrennt</span>
            <div class="text-slate-300">{{ fmtDate(e.date_separated) }}</div>
          </div>
          <div>
            <span class="text-slate-500">Eiablage / Geburt</span>
            <div class="text-slate-300">{{ fmtDate(e.date_eggs_or_birth) }}</div>
          </div>
          <div>
            <span class="text-slate-500">Gelege</span>
            <div class="text-slate-300">
              {{ e.clutch_size != null ? e.clutch_size : '—' }}
              <span v-if="e.fertile_count != null"> ({{ e.fertile_count }} fertil)</span>
            </div>
          </div>
        </div>
        <div v-if="e.notes" class="mt-2 text-xs text-slate-500">{{ e.notes }}</div>
      </div>
    </div>
  </div>
</template>
