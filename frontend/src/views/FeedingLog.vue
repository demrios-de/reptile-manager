<script setup>
import { ref, onMounted, watch } from 'vue'
import { feedings as feedingsApi, animals as animalsApi } from '@/api'

const list = ref([])
const allAnimals = ref([])
const filterAnimal = ref('')
const loading = ref(true)

// New feeding form
const showForm = ref(false)
const saving = ref(false)
const form = ref({
  animal_id: '', date: new Date().toISOString().slice(0,16),
  food_type: '', food_size: '', food_count: 1,
  food_weight_g: '', live: false, accepted: true, notes: ''
})

onMounted(async () => {
  const [fRes, aRes] = await Promise.all([
    feedingsApi.list({ limit: 200 }),
    animalsApi.list({ active_only: false, limit: 500 })
  ])
  list.value = fRes.data
  allAnimals.value = aRes.data
  loading.value = false
})

watch(filterAnimal, async () => {
  loading.value = true
  const params = filterAnimal.value ? { animal_id: filterAnimal.value, limit: 200 } : { limit: 200 }
  list.value = (await feedingsApi.list(params)).data
  loading.value = false
})

async function addFeeding() {
  saving.value = true
  try {
    const payload = { ...form.value, animal_id: parseInt(form.value.animal_id) }
    if (!payload.food_weight_g) payload.food_weight_g = null
    const res = await feedingsApi.create(payload)
    const animal = allAnimals.value.find(a => a.id === res.data.animal_id)
    list.value.unshift({ ...res.data, animal_name: animal?.name })
    showForm.value = false
    form.value = { animal_id: '', date: new Date().toISOString().slice(0,16), food_type: '', food_size: '', food_count: 1, food_weight_g: '', live: false, accepted: true, notes: '' }
  } finally {
    saving.value = false
  }
}

async function deleteFeeding(id) {
  if (!confirm('Fütterung löschen?')) return
  await feedingsApi.delete(id)
  list.value = list.value.filter(f => f.id !== id)
}

function fmtDateTime(d) {
  return d ? new Date(d).toLocaleString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—'
}
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <h1 class="text-2xl font-bold text-slate-200">Fütterungen</h1>
      <button class="btn-primary btn-sm" @click="showForm = !showForm">+ Fütterung eintragen</button>
    </div>

    <!-- Filters -->
    <div class="mb-5 flex gap-3 flex-wrap">
      <div class="flex-1 min-w-[200px]">
        <select v-model="filterAnimal">
          <option value="">Alle Tiere</option>
          <option v-for="a in allAnimals" :key="a.id" :value="a.id">{{ a.name }}</option>
        </select>
      </div>
    </div>

    <!-- Form -->
    <div v-if="showForm" class="card mb-5">
      <h3 class="font-medium text-slate-200 mb-3">Neue Fütterung</h3>
      <form @submit.prevent="addFeeding" class="grid sm:grid-cols-3 gap-3">
        <div>
          <label>Tier *</label>
          <select v-model="form.animal_id" required>
            <option value="">Tier wählen…</option>
            <option v-for="a in allAnimals.filter(a => a.is_active)" :key="a.id" :value="a.id">{{ a.name }}</option>
          </select>
        </div>
        <div><label>Datum & Zeit</label><input type="datetime-local" v-model="form.date" required /></div>
        <div><label>Futtertier *</label><input v-model="form.food_type" placeholder="Maus, Ratte…" required /></div>
        <div><label>Größe</label><input v-model="form.food_size" placeholder="Pinky, Adult…" /></div>
        <div><label>Anzahl</label><input type="number" v-model="form.food_count" min="1" /></div>
        <div><label>Gewicht (g)</label><input type="number" v-model="form.food_weight_g" step="0.1" /></div>
        <div class="flex gap-4 items-end pb-2">
          <label class="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" v-model="form.live" class="w-4 h-4" /> Lebend
          </label>
          <label class="flex items-center gap-2 cursor-pointer text-sm">
            <input type="checkbox" v-model="form.accepted" class="w-4 h-4" /> Akzeptiert
          </label>
        </div>
        <div class="sm:col-span-3"><label>Notizen</label><textarea v-model="form.notes" rows="2" /></div>
        <div class="sm:col-span-3 flex gap-2">
          <button type="submit" class="btn-primary btn-sm" :disabled="saving">
            {{ saving ? 'Speichern…' : 'Eintragen' }}
          </button>
          <button type="button" class="btn-secondary btn-sm" @click="showForm = false">Abbrechen</button>
        </div>
      </form>
    </div>

    <!-- Table -->
    <div class="card overflow-x-auto -mx-1">
      <div v-if="loading" class="text-slate-500 text-center py-8">Lade…</div>
      <div v-else-if="!list.length" class="text-slate-500 text-center py-8">Keine Fütterungen gefunden</div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="text-left text-slate-500 border-b border-surface-600">
            <th class="pb-2 pr-4">Tier</th>
            <th class="pb-2 pr-4">Datum</th>
            <th class="pb-2 pr-4">Futter</th>
            <th class="pb-2 pr-4">Gewicht</th>
            <th class="pb-2 pr-4">Status</th>
            <th class="pb-2 pr-4">Notiz</th>
            <th class="pb-2"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in list" :key="f.id" class="table-row">
            <td class="py-2 pr-4 font-medium text-slate-200">{{ f.animal_name }}</td>
            <td class="py-2 pr-4 text-slate-400 whitespace-nowrap">{{ fmtDateTime(f.date) }}</td>
            <td class="py-2 pr-4 text-slate-300">
              {{ f.food_count > 1 ? `${f.food_count}×` : '' }} {{ f.food_size }} {{ f.food_type }}
              <span v-if="f.live" class="badge-blue ml-1">Lebend</span>
            </td>
            <td class="py-2 pr-4 text-slate-400">{{ f.food_weight_g ? `${f.food_weight_g}g` : '—' }}</td>
            <td class="py-2 pr-4">
              <span :class="f.accepted ? 'badge-green' : 'badge-red'">
                {{ f.accepted ? '✓ OK' : '✗ Abgelehnt' }}
              </span>
            </td>
            <td class="py-2 pr-4 text-slate-500 max-w-[120px] truncate">{{ f.notes }}</td>
            <td class="py-2">
              <button @click="deleteFeeding(f.id)" class="text-slate-600 hover:text-red-400 transition-colors">🗑</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
