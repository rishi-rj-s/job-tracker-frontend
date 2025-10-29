<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo & Navigation -->
          <div class="flex items-center gap-8">
            <router-link to="/dashboard" class="flex items-center gap-2">
              <Briefcase class="h-8 w-8 text-indigo-600" />
              <span class="text-2xl font-bold text-gray-900">JobTracker</span>
            </router-link>

            <nav class="hidden md:flex items-center gap-1">
              <router-link to="/dashboard"
                           class="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                           exact-active-class="bg-indigo-50 text-indigo-700"
                           :class="$route.path === '/dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'">
                <Home class="h-4 w-4" />
                Dashboard
              </router-link>
              <router-link to="/dashboard/jobs"
                           class="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                           active-class="bg-indigo-50 text-indigo-700"
                           :class="$route.path.startsWith('/dashboard/jobs') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'">
                <BriefcaseIcon class="h-4 w-4" />
                Applications
              </router-link>
            </nav>
          </div>

          <!-- Right Side Actions -->
          <div class="flex items-center gap-4">
            <!-- Sync Button -->
            <button 
              v-if="syncStore.isSyncing || jobStore.hasPendingChanges"
              @click="handleSync"
              :disabled="syncStore.isSyncing"
              class="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <RefreshCw :class="['h-4 w-4', syncStore.isSyncing ? 'animate-spin' : '']" />
              <span v-if="syncStore.isSyncing">Syncing...</span>
              <span v-else>Sync ({{ jobStore.pendingCount }})</span>
            </button>

            <!-- Export Dropdown -->
            <div class="relative" ref="exportDropdown">
              <button 
                @click="showExportMenu = !showExportMenu"
                class="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all">
                <Download class="h-4 w-4" />
                Export
                <ChevronDown class="h-4 w-4" />
              </button>
              
              <div v-if="showExportMenu" 
                   class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button @click="handleExport('csv')"
                        class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2">
                  <FileSpreadsheet class="h-4 w-4" />
                  Export as CSV
                </button>
                <button @click="handleExport('json')"
                        class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2">
                  <FileJson class="h-4 w-4" />
                  Export as JSON
                </button>
              </div>
            </div>

            <!-- User Profile Dropdown -->
            <div class="relative" ref="userDropdown">
              <button 
                @click="showUserMenu = !showUserMenu"
                class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-all">
                <div class="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {{ userInitials }}
                </div>
                <ChevronDown class="h-4 w-4 text-gray-500 hidden sm:block" />
              </button>

              <div v-if="showUserMenu" 
                   class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <div class="px-4 py-3 border-b border-gray-200">
                  <p class="text-sm font-medium text-gray-900">{{ authStore.user?.email }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ authStore.user?.user_metadata?.full_name || 'User' }}</p>
                </div>
                <button @click="handleLogout"
                        class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  <LogOut class="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>

            <!-- Mobile Menu Toggle -->
            <button 
              @click="showMobileMenu = !showMobileMenu"
              class="md:hidden p-2 rounded-lg hover:bg-gray-100">
              <Menu class="h-6 w-6" />
            </button>
          </div>
        </div>

        <!-- Mobile Navigation -->
        <nav v-if="showMobileMenu" class="md:hidden py-4 border-t border-gray-200">
          <router-link 
            to="/dashboard"
            @click="showMobileMenu = false"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all"
            active-class="bg-indigo-50 text-indigo-700"
            :class="$route.path === '/dashboard' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'">
            <Home class="h-5 w-5" />
            Dashboard
          </router-link>
          <router-link 
            to="/dashboard/jobs"
            @click="showMobileMenu = false"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all"
            active-class="bg-indigo-50 text-indigo-700"
            :class="$route.path.startsWith('/dashboard/jobs') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'">
            <BriefcaseIcon class="h-5 w-5" />
            Applications
          </router-link>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Toast Notifications -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Briefcase, Home, Briefcase as BriefcaseIcon, LogOut, Menu, ChevronDown, RefreshCw, Download, FileSpreadsheet, FileJson } from 'lucide-vue-next'
import { useAuthStore } from '../stores/authStore'
import { useJobStore } from '../stores/jobStore'
import { useSyncStore } from '../stores/syncStore'
import { useToast } from '../lib/composables/useToast'
import Toast from '../components/Toast.vue'

const router = useRouter()
const authStore = useAuthStore()
const jobStore = useJobStore()
const syncStore = useSyncStore()
const { showToast } = useToast()

const showUserMenu = ref(false)
const showMobileMenu = ref(false)
const showExportMenu = ref(false)
const userDropdown = ref<HTMLElement | null>(null)
const exportDropdown = ref<HTMLElement | null>(null)

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

const handleExport = async (format: 'csv' | 'json') => {
  showExportMenu.value = false
  const result = await jobStore.exportJobs(format)
  
  if (result.success) {
    showToast(result.message || 'Export successful!', 'green')
  } else {
    showToast(result.message || 'Export failed', 'red')
  }
}

const handleLogout = async () => {
  showUserMenu.value = false
  const result = await authStore.signOut()
  
  if (result.success) {
    showToast('Logged out successfully', 'green')
    router.push('/login')
  } else {
    showToast('Logout failed', 'red')
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (userDropdown.value && !userDropdown.value.contains(event.target as Node)) {
    showUserMenu.value = false
  }
  if (exportDropdown.value && !exportDropdown.value.contains(event.target as Node)) {
    showExportMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>