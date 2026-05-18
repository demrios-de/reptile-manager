<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()
const sidebarOpen = ref(true)

const nav = [
  { to: '/dashboard', icon: '⬛', label: 'Dashboard' },
  { to: '/animals',   icon: '🦎', label: 'Tiere' },
  { to: '/feedings',  icon: '🍖', label: 'Fütterungen' },
  { to: '/sheddings', icon: '🐚', label: 'Häutungen' },
  { to: '/breeding',  icon: '🥚', label: 'Zucht' },
  { to: '/settings',  icon: '⚙️', label: 'Einstellungen' },
]

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <aside
      :class="sidebarOpen ? 'w-56' : 'w-16'"
      class="flex-shrink-0 bg-surface-800 border-r border-surface-600 flex flex-col transition-all duration-200"
    >
      <!-- Logo -->
      <div class="flex items-center gap-3 px-4 py-5 border-b border-surface-600">
        <span class="text-2xl">🦎</span>
        <span v-if="sidebarOpen" class="font-bold text-brand-400 text-lg leading-tight">Reptile<br>Manager</span>
      </div>

      <!-- Nav -->
      <nav class="flex-1 py-4 overflow-y-auto">
        <RouterLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-slate-400
                 hover:text-slate-200 hover:bg-surface-600 transition-colors"
          active-class="!text-brand-400 !bg-surface-600"
        >
          <span class="text-lg w-6 text-center flex-shrink-0">{{ item.icon }}</span>
          <span v-if="sidebarOpen" class="text-sm font-medium">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <!-- User -->
      <div class="border-t border-surface-600 p-3">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            {{ auth.user?.username?.[0]?.toUpperCase() ?? '?' }}
          </div>
          <div v-if="sidebarOpen" class="flex-1 min-w-0">
            <p class="text-sm font-medium text-slate-200 truncate">{{ auth.user?.username }}</p>
            <button @click="logout" class="text-xs text-slate-500 hover:text-red-400 transition-colors">
              Abmelden
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Topbar -->
      <header class="bg-surface-800 border-b border-surface-600 px-6 py-3 flex items-center gap-4 flex-shrink-0">
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="text-slate-400 hover:text-slate-200 transition-colors"
        >
          ☰
        </button>
      </header>

      <!-- Page -->
      <main class="flex-1 overflow-y-auto p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
