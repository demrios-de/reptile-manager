<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { animals as animalsApi } from '@/api'

const route = useRoute()
const router = useRouter()
const photoFile = ref(null)
const photoPreview = ref(null)
const uploadingPhoto = ref(false)

function onPhotoSelect(e) {
  const file = e.target.files[0]
  if (!file) return
  photoFile.value = file
  photoPreview.value = URL.createObjectURL(file)
}

async function uploadPhoto(animalId) {
  if (!photoFile.value) return
  uploadingPhoto.value = true
  try {
    const res = await animalsApi.uploadPhoto(animalId, photoFile.value)
    form.value.photo_url = res.data.photo_url
    photoFile.value = null
  } finally {
    uploadingPhoto.value = false
  }
}
const isEdit = computed(() => !!route.params.id)
const saving = ref(false)
const allAnimals = ref([])

const form = ref({
  name: '', species: '', common_name: '', morph: '',
  sex: 'unknown', date_of_birth: '', date_acquired: '',
  origin: '', weight_g: '', length_cm: '',
  photo_url: '', notes: '', is_active: true,
  mother_id: null, father_id: null,
})

onMounted(async () => {
  // Load all animals for parent selection
  const res = await animalsApi.list({ active_only: false, limit: 500 })
  allAnimals.value = res.data

  if (isEdit.value) {
    loading.value = true
    try {
      const { data } = await animalsApi.get(route.params.id)
      Object.keys(form.value).forEach(k => {
        if (data[k] !== undefined && data[k] !== null) {
          form.value[k] = data[k]
        }
      })
      // Format dates for input
      if (data.date_of_birth) form.value.date_of_birth = data.date_of_birth.split('T')[0]
      if (data.date_acquired) form.value.date_acquired = data.date_acquired.split('T')[0]
    } finally {
      loading.value = false
    }
  }
})

async function save() {
  saving.value = true
  try {
    const payload = { ...form.value }
    if (!payload.weight_g) payload.weight_g = null
    if (!payload.length_cm) payload.length_cm = null
    if (!payload.date_of_birth) payload.date_of_birth = null
    if (!payload.date_acquired) payload.date_acquired = null

    let savedId
    if (isEdit.value) {
      await animalsApi.update(route.params.id, payload)
      savedId = route.params.id
    } else {
      const res = await animalsApi.create(payload)
      savedId = res.data.id
    }

    // Upload photo if one was selected
    if (photoFile.value) {
      await uploadPhoto(savedId)
    }

    router.push(`/animals/${savedId}`)
  } finally {
    saving.value = false
  }
}

// Filter out self from parent options
const parentOptions = computed(() => {
  const selfId = isEdit.value ? parseInt(route.params.id) : null
  return allAnimals.value.filter(a => a.id !== selfId)
})
</script>

<template>
  <div class="max-w-2xl">
    <div class="flex items-center gap-3 mb-6">
      <button class="btn-secondary btn-sm" @click="router.back()">← Zurück</button>
      <h1 class="text-2xl font-bold text-slate-200">
        {{ isEdit ? 'Tier bearbeiten' : 'Tier hinzufügen' }}
      </h1>
    </div>

    <div v-if="loading" class="text-slate-500 text-center py-16">Lade…</div>

    <form v-else @submit.prevent="save" class="card space-y-5">
      <!-- Basic info -->
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label>Name *</label>
          <input v-model="form.name" required placeholder="z.B. Noodle" />
        </div>
        <div>
          <label>Geschlecht</label>
          <select v-model="form.sex">
            <option value="unknown">Unbekannt</option>
            <option value="male">Männlich ♂</option>
            <option value="female">Weiblich ♀</option>
          </select>
        </div>
        <div>
          <label>Wissenschaftlicher Name *</label>
          <input v-model="form.species" required placeholder="Python regius" />
        </div>
        <div>
          <label>Trivialname</label>
          <input v-model="form.common_name" placeholder="Königspython" />
        </div>
        <div class="sm:col-span-2">
          <label>Morph / Farbform</label>
          <input v-model="form.morph" placeholder="z.B. Pastel Clown, Leucistic…" />
        </div>
      </div>

      <hr class="border-surface-500" />

      <!-- Dates & origin -->
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label>Geburtsdatum</label>
          <input type="date" v-model="form.date_of_birth" />
        </div>
        <div>
          <label>Erworben am</label>
          <input type="date" v-model="form.date_acquired" />
        </div>
        <div>
          <label>Herkunft</label>
          <select v-model="form.origin">
            <option value="">Nicht angegeben</option>
            <option value="captive bred">Nachzucht (CB)</option>
            <option value="wild caught">Wildfang (WC)</option>
            <option value="farm bred">Farmzucht (FB)</option>
            <option value="imported">Import</option>
          </select>
        </div>
      </div>

      <hr class="border-surface-500" />

      <!-- Measurements -->
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label>Gewicht (g)</label>
          <input type="number" v-model="form.weight_g" step="0.1" min="0" placeholder="1200" />
        </div>
        <div>
          <label>Länge (cm)</label>
          <input type="number" v-model="form.length_cm" step="0.1" min="0" placeholder="120" />
        </div>
      </div>

      <hr class="border-surface-500" />

      <!-- Parentage -->
      <div>
        <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Elterntiere</h3>
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label>Mutter ♀</label>
            <select v-model="form.mother_id">
              <option :value="null">— keine —</option>
              <option v-for="a in parentOptions.filter(a => a.sex !== 'male')" :key="a.id" :value="a.id">
                {{ a.name }} ({{ a.species }})
              </option>
            </select>
          </div>
          <div>
            <label>Vater ♂</label>
            <select v-model="form.father_id">
              <option :value="null">— keine —</option>
              <option v-for="a in parentOptions.filter(a => a.sex !== 'female')" :key="a.id" :value="a.id">
                {{ a.name }} ({{ a.species }})
              </option>
            </select>
          </div>
        </div>
      </div>

      <hr class="border-surface-500" />

      <!-- Photo -->
      <div>
        <label class="mb-2 block">Foto</label>
        <div class="flex gap-4 items-start">
          <!-- Preview -->
          <div class="w-24 h-24 rounded-lg bg-surface-600 flex-shrink-0 overflow-hidden flex items-center justify-center border border-surface-500">
            <img v-if="photoPreview || form.photo_url"
                 :src="photoPreview || form.photo_url"
                 class="w-full h-full object-cover" />
            <span v-else class="text-3xl opacity-30">🦎</span>
          </div>
          <!-- Inputs -->
          <div class="flex-1 space-y-2">
            <div>
              <label class="text-xs text-slate-500 mb-1">Datei hochladen</label>
              <input type="file" accept="image/*" @change="onPhotoSelect"
                     class="file:btn-secondary file:btn-sm file:mr-2 file:cursor-pointer text-sm" />
              <p class="text-xs text-slate-600 mt-1">Oder URL angeben:</p>
            </div>
            <input v-model="form.photo_url" type="url" placeholder="https://…" class="text-sm" />
          </div>
        </div>
      </div>
      <div>
        <label>Notizen</label>
        <textarea v-model="form.notes" rows="3" placeholder="Besonderheiten, Herkunft, Zuchtgeschichte…"></textarea>
      </div>

      <!-- Active flag -->
      <label class="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" v-model="form.is_active" class="w-4 h-4" />
        <span class="text-sm text-slate-300">Tier ist aktiv (in der Haltung)</span>
      </label>

      <!-- Actions -->
      <div class="flex gap-3 pt-2">
        <button type="submit" class="btn-primary" :disabled="saving">
          {{ saving ? 'Speichern…' : isEdit ? 'Änderungen speichern' : 'Tier anlegen' }}
        </button>
        <button type="button" class="btn-secondary" @click="router.back()">Abbrechen</button>
      </div>
    </form>
  </div>
</template>
