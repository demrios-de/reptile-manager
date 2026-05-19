<script setup>
import { ref, onMounted } from 'vue'
import { dashboard } from '@/api'
import { useRouter } from 'vue-router'

const router = useRouter()
const stats = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await dashboard.stats()
    stats.value = res.data
  } finally {
    loading.value = false
  }
})

function daysSince(dateStr) {
  if (!dateStr) return null
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.floor(diff / 86400000)
}

function fmtDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function foodLabel(f) {
  return [f.food_count > 1 ? `${f.food_count}×` : '', f.food_size, f.food_type].filter(Boolean).join(' ')
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-slate-200 mb-6">Dashboard</h1>

    <div v-if="loading" class="text-slate-500 text-center py-16">Lade…</div>

    <template v-else-if="stats">
      <!-- Stat cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="stat-card cursor-pointer hover:border-brand-500 border border-surface-600 transition-colors"
             @click="router.push('/animals')">
          <span class="text-3xl">🦎</span>
          <span class="text-3xl font-bold text-slate-200">{{ stats.active_animals }}</span>
          <span class="text-sm text-slate-500">Aktive Tiere</span>
        </div>

        <div class="stat-card cursor-pointer hover:border-brand-500 border border-surface-600 transition-colors"
             @click="router.push('/feedings')">
          <span class="text-3xl">🍖</span>
          <span class="text-3xl font-bold text-slate-200">{{ stats.feedings_this_month }}</span>
          <span class="text-sm text-slate-500">Fütterungen diesen Monat</span>
        </div>

        <div class="stat-card cursor-pointer hover:border-brand-500 border border-surface-600 transition-colors"
             @click="router.push('/sheddings')">
          <span class="text-3xl">🐚</span>
          <span class="text-3xl font-bold text-slate-200">{{ stats.sheddings_this_month }}</span>
          <span class="text-sm text-slate-500">Häutungen diesen Monat</span>
        </div>

        <div class="stat-card" :class="stats.animals_not_fed_7days > 0 ? 'border border-yellow-700' : 'border border-surface-600'">
          <span class="text-3xl">⚠️</span>
          <span class="text-3xl font-bold" :class="stats.animals_not_fed_7days > 0 ? 'text-yellow-400' : 'text-slate-200'">
            {{ stats.animals_not_fed_7days }}
          </span>
          <span class="text-sm text-slate-500">Nicht gefüttert (7 Tage)</span>
        </div>
      </div>

      <!-- Recent activity -->
      <div class="grid lg:grid-cols-2 gap-6">
        <!-- Recent feedings -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-semibold text-slate-200">Letzte Fütterungen</h2>
            <button class="text-sm text-brand-400 hover:text-brand-500" @click="router.push('/feedings')">
              Alle →
            </button>
          </div>
          <div v-if="!stats.recent_feedings.length" class="text-slate-500 text-sm">Keine Einträge</div>
          <div v-for="f in stats.recent_feedings" :key="f.id" class="flex items-center gap-3 py-2.5 border-b border-surface-600 last:border-0">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-slate-200 truncate">{{ f.animal_name }}</span>
                <span :class="f.accepted ? 'badge-green' : 'badge-red'">
                  {{ f.accepted ? 'Akzeptiert' : 'Abgelehnt' }}
                </span>
              </div>
              <span class="text-xs text-slate-500">{{ foodLabel(f) }} · {{ fmtDate(f.date) }}</span>
            </div>
          </div>
        </div>

        <!-- Recent sheddings -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-semibold text-slate-200">Letzte Häutungen</h2>
            <button class="text-sm text-brand-400 hover:text-brand-500" @click="router.push('/sheddings')">
              Alle →
            </button>
          </div>
          <div v-if="!stats.recent_sheddings.length" class="text-slate-500 text-sm">Keine Einträge</div>
          <div v-for="s in stats.recent_sheddings" :key="s.id" class="flex items-center gap-3 py-2.5 border-b border-surface-600 last:border-0">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-slate-200 truncate">{{ s.animal_name }}</span>
                <span :class="s.complete ? 'badge-green' : 'badge-yellow'">
                  {{ s.complete ? 'Komplett' : 'Unvollständig' }}
                </span>
                <span v-if="!s.in_one_piece" class="badge-red">Gerissen</span>
              </div>
              <span class="text-xs text-slate-500">{{ fmtDate(s.date) }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
