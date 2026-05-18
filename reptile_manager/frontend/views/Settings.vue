<script setup>
import { ref, onMounted } from 'vue'
import { ha } from '@/api'

const config = ref(null)
const haToken = ref('')
const saving = ref(false)
const testing = ref(false)
const syncing = ref(false)
const testResult = ref(null)
const saved = ref(false)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await ha.getConfig()
    config.value = res.data
  } finally {
    loading.value = false
  }
})

async function saveConfig() {
  saving.value = true
  saved.value = false
  try {
    const payload = { ...config.value }
    if (haToken.value) payload.ha_token = haToken.value
    const res = await ha.updateConfig(payload)
    config.value = res.data
    haToken.value = ''
    saved.value = true
    setTimeout(() => saved.value = false, 3000)
  } finally {
    saving.value = false
  }
}

async function testConnection() {
  testing.value = true
  testResult.value = null
  try {
    const res = await ha.test()
    testResult.value = res.data
  } finally {
    testing.value = false
  }
}

async function syncNow() {
  syncing.value = true
  try {
    await ha.sync()
    alert('Sync erfolgreich!')
  } catch (e) {
    alert('Sync fehlgeschlagen: ' + (e.response?.data?.detail ?? e.message))
  } finally {
    syncing.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl">
    <h1 class="text-2xl font-bold text-slate-200 mb-6">Einstellungen</h1>

    <div v-if="loading" class="text-slate-500 text-center py-16">Lade…</div>

    <div v-else-if="config" class="space-y-6">

      <!-- HA Integration -->
      <div class="card">
        <div class="flex items-center gap-3 mb-5">
          <span class="text-2xl">🏠</span>
          <div>
            <h2 class="font-semibold text-slate-200">Home Assistant Integration</h2>
            <p class="text-xs text-slate-500">Events an HA senden · Sensoren bereitstellen</p>
          </div>
          <div class="ml-auto">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="config.enabled" class="w-4 h-4" />
              <span class="text-sm text-slate-300">Aktiv</span>
            </label>
          </div>
        </div>

        <form @submit.prevent="saveConfig" class="space-y-4">
          <div>
            <label>Home Assistant URL</label>
            <input v-model="config.ha_url" type="url" placeholder="http://homeassistant.local:8123" />
            <p class="text-xs text-slate-500 mt-1">Intern erreichbare URL deiner HA-Instanz</p>
          </div>

          <div>
            <label>Long-Lived Access Token</label>
            <input v-model="haToken" type="password" placeholder="Leer lassen um beizubehalten" />
            <p class="text-xs text-slate-500 mt-1">
              HA → Profil → Sicherheit → Langzeit-Zugriffstoken erstellen
            </p>
          </div>

          <div>
            <label>Webhook-ID (für Events)</label>
            <input v-model="config.webhook_id" placeholder="reptile_manager_events" />
            <p class="text-xs text-slate-500 mt-1">
              HA → Einstellungen → Automatisierungen → Auslöser: Webhook
            </p>
          </div>

          <div>
            <label>Tage ohne Fütterung (Warnschwelle)</label>
            <input type="number" v-model="config.feeding_reminder_days" min="1" max="90" />
          </div>

          <hr class="border-surface-500" />

          <div>
            <h3 class="text-sm font-medium text-slate-400 mb-3">Benachrichtigungen senden bei…</h3>
            <div class="space-y-2">
              <label class="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" v-model="config.notify_feeding" class="w-4 h-4" /> Fütterung eingetragen
              </label>
              <label class="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" v-model="config.notify_shedding" class="w-4 h-4" /> Häutung eingetragen
              </label>
              <label class="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" v-model="config.notify_breeding" class="w-4 h-4" /> Zuchtereignis angelegt
              </label>
            </div>
          </div>

          <div class="flex gap-3 flex-wrap pt-2">
            <button type="submit" class="btn-primary" :disabled="saving">
              {{ saving ? 'Speichern…' : 'Speichern' }}
            </button>
            <button type="button" class="btn-secondary" :disabled="testing" @click="testConnection">
              {{ testing ? 'Teste…' : 'Verbindung testen' }}
            </button>
            <button type="button" class="btn-secondary" :disabled="syncing || !config.enabled" @click="syncNow">
              {{ syncing ? 'Sync…' : '⬆ Jetzt synchronisieren' }}
            </button>
          </div>

          <div v-if="saved" class="text-brand-400 text-sm">✓ Gespeichert</div>

          <div v-if="testResult" :class="testResult.success ? 'text-brand-400' : 'text-red-400'" class="text-sm">
            {{ testResult.success ? '✓ ' + testResult.message : '✗ ' + testResult.error }}
          </div>
        </form>
      </div>

      <!-- HA YAML snippet -->
      <div class="card">
        <h2 class="font-semibold text-slate-200 mb-3">📋 Home Assistant Konfiguration</h2>
        <p class="text-sm text-slate-400 mb-3">
          Füge folgendes in deine <code class="text-brand-400">configuration.yaml</code> ein,
          um Reptile Manager Sensoren in HA zu haben:
        </p>
        <pre class="bg-surface-900 rounded-lg p-4 text-xs text-slate-300 overflow-x-auto"><code>rest:
  - resource: http://DEIN_SERVER:8000/api/ha/sensors
    scan_interval: 300  # alle 5 Minuten
    sensor:
      - name: "Reptilien gesamt"
        value_template: "{{ '{{' }} value_json.summary.active_animals {{ '}}' }}"
        unit_of_measurement: "Tiere"
        icon: mdi:snake
      - name: "Reptilien nicht gefüttert"
        value_template: "{{ '{{' }} value_json.summary.animals_not_fed_7days {{ '}}' }}"
        unit_of_measurement: "Tiere"
        icon: mdi:food-off

automation:
  - alias: "Reptilien Fütterungswarnung"
    trigger:
      platform: numeric_state
      entity_id: sensor.reptilien_nicht_gefuettert
      above: 0
    action:
      service: notify.mobile_app_dein_handy
      data:
        message: "{{ '{{' }} states('sensor.reptilien_nicht_gefuettert') {{ '}}' }} Reptilien seit 7+ Tagen nicht gefüttert!"</code></pre>
      </div>

      <!-- Webhook info -->
      <div class="card">
        <h2 class="font-semibold text-slate-200 mb-3">🔗 Webhook Events</h2>
        <p class="text-sm text-slate-400 mb-3">
          Reptile Manager sendet folgende Events an deinen HA Webhook:
        </p>
        <div class="space-y-2">
          <div v-for="ev in [
            { type: 'reptile_feeding', desc: 'Bei jeder Fütterung', fields: 'animal_name, food_type, food_size, accepted' },
            { type: 'reptile_shedding', desc: 'Bei jeder Häutung', fields: 'animal_name, complete, in_one_piece' },
            { type: 'reptile_breeding', desc: 'Bei jedem Zuchtereignis', fields: 'female_name, male_name, date_paired' },
          ]" :key="ev.type" class="bg-surface-900 rounded-lg p-3">
            <div class="flex items-center gap-2">
              <code class="text-brand-400 text-xs">{{ ev.type }}</code>
              <span class="text-xs text-slate-500">·</span>
              <span class="text-xs text-slate-500">{{ ev.desc }}</span>
            </div>
            <div class="text-xs text-slate-600 mt-0.5">Felder: {{ ev.fields }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
