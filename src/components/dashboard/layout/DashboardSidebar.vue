<template>
  <aside 
    :class="[
      'fixed top-0 bottom-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out',
      open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    ]"
  >
    <div class="flex flex-col h-screen">
      <!-- Logo -->
      <div class="flex items-center justify-between p-4 border-b border-gray-800 shrink-0">
        <router-link to="/" class="flex items-center gap-2">
          <Briefcase class="h-8 w-8 text-indigo-400" />
          <span class="text-xl font-bold text-white">ApplyLog</span>
        </router-link>
        <button 
          @click="$emit('update:open', false)"
          class="lg:hidden text-gray-400 hover:text-white"
        >
          <X class="h-6 w-6" />
        </button>
      </div>

      <!-- Navigation (Scrollable) -->
      <nav class="p-4 space-y-2 flex-1 overflow-y-auto">
        <router-link
          to="/dashboard"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          exact-active-class="bg-indigo-600 text-white"
        >
          <Home class="h-5 w-5" />
          <span>Dashboard</span>
        </router-link>

        <router-link
          to="/dashboard/jobs"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          active-class="bg-indigo-600 text-white"
        >
          <BriefcaseIcon class="h-5 w-5" />
          <span>Applications</span>
        </router-link>

        <router-link
          to="/dashboard/calendar"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          active-class="bg-indigo-600 text-white"
        >
          <Calendar class="h-5 w-5" />
          <span>Calendar</span>
        </router-link>

        <router-link
          to="/dashboard/analytics"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          active-class="bg-indigo-600 text-white"
        >
          <BarChart3 class="h-5 w-5" />
          <span>Analytics</span>
        </router-link>

        <router-link
          to="/dashboard/contacts"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          active-class="bg-indigo-600 text-white"
        >
          <Users class="h-5 w-5" />
          <span>Contacts</span>
        </router-link>

        <!-- Sync Status -->
        <div 
          v-if="jobStore.hasPendingChanges"
          class="mt-4 px-4 py-3 bg-yellow-900/30 border border-yellow-700/50 rounded-lg"
        >
          <div class="flex items-center gap-2 text-yellow-400 text-sm mb-2">
            <RefreshCw class="h-4 w-4" />
            <span class="font-medium">{{ jobStore.pendingCount }} pending</span>
          </div>
          <button
            @click="handleSync"
            :disabled="syncStore.isSyncing"
            class="w-full px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            {{ syncStore.isSyncing ? 'Syncing...' : 'Sync Now' }}
          </button>
        </div>
      </nav>

      <!-- User Profile (Fixed at bottom) -->
      <div class="p-4 border-t border-gray-800 shrink-0">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
            {{ userInitials }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-white truncate">
              {{ authStore.user?.user_metadata?.full_name || 'User' }}
            </div>
            <div class="text-xs text-gray-400 truncate">
              {{ authStore.user?.email }}
            </div>
          </div>
        </div>

        <button
          @click="$emit('logout')"
          class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 rounded-lg transition-colors"
        >
          <LogOut class="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  Briefcase, 
  Home, 
  Briefcase as BriefcaseIcon, 
  Calendar,
  BarChart3,
  Users,
  LogOut, 
  X, 
  RefreshCw 
} from 'lucide-vue-next'
import { useAuthStore } from '@stores/authStore'
import { useJobStore } from '@stores/jobStore'
import { useSyncStore } from '@stores/syncStore'

defineProps<{
  open: boolean
}>()

defineEmits<{
  'update:open': [value: boolean]
  'logout': []
}>()

const authStore = useAuthStore()
const jobStore = useJobStore()
const syncStore = useSyncStore()

const userInitials = computed(() => {
  const email = authStore.user?.email || ''
  const name = authStore.user?.user_metadata?.full_name
  
  if (name) {
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  }
  
  return email.substring(0, 2).toUpperCase()
})

const handleSync = async () => {
  await syncStore.syncAll()
}
</script>