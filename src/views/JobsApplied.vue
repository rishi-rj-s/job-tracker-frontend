<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">My Applications</h1>
        <p class="text-gray-600 mt-1">Track and manage all your job applications</p>
      </div>
      
      <div class="flex items-center gap-3">
        <!-- Pending Changes Indicator -->
        <div v-if="jobStore.hasPendingChanges" 
             class="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          <RefreshCw class="h-4 w-4" />
          <span>{{ jobStore.pendingCount }} pending changes</span>
        </div>

        <!-- Sync Button -->
        <button 
          v-if="jobStore.hasPendingChanges"
          @click="handleSync"
          :disabled="syncStore.isSyncing"
          class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50">
          <RefreshCw :class="['h-4 w-4', syncStore.isSyncing ? 'animate-spin' : '']" />
          {{ syncStore.isSyncing ? 'Syncing...' : 'Sync Data' }}
        </button>
      </div>
    </div>

    <!-- Add Job Form -->
    <JobForm />

    <!-- Edit Modal -->
    <EditModal />

    <!-- Stats Summary -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div v-for="(stat, index) in statusStats" :key="index"
           class="bg-white rounded-lg p-4 border border-gray-200">
        <div class="text-2xl font-bold text-gray-900">{{ stat.count }}</div>
        <div class="text-sm text-gray-600">{{ stat.label }}</div>
      </div>
    </div>

    <!-- Jobs List -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <JobList />
    </div>

    <!-- Pagination -->
    <div v-if="jobStore.totalPages > 1" class="flex justify-center items-center gap-2">
      <button 
        @click="changePage(jobStore.currentPage - 1)"
        :disabled="jobStore.currentPage === 1"
        class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
        Previous
      </button>
      
      <div class="flex items-center gap-2">
        <button 
          v-for="page in visiblePages" 
          :key="page"
          @click="changePage(page)"
          :class="[
            'px-4 py-2 rounded-lg transition-all',
            page === jobStore.currentPage
              ? 'bg-indigo-600 text-white font-semibold'
              : 'bg-white border border-gray-300 hover:bg-gray-50'
          ]">
          {{ page }}
        </button>
      </div>

      <button 
        @click="changePage(jobStore.currentPage + 1)"
        :disabled="jobStore.currentPage === jobStore.totalPages"
        class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RefreshCw } from 'lucide-vue-next'
import { useJobStore } from '../stores/jobStore'
import { useSyncStore } from '../stores/syncStore'
import { useStatusStore } from '../stores/statusStore'
import { usePlatformStore } from '../stores/platformStore'
import JobForm from '../components/JobForm.vue'
import JobList from '../components/JobList.vue'
import EditModal from '../components/EditModal.vue'

const jobStore = useJobStore()
const syncStore = useSyncStore()
const statusStore = useStatusStore()
const platformStore = usePlatformStore()

const statusStats = computed(() => [
  { label: 'Total', count: jobStore.jobs.length },
  { label: 'Applied', count: jobStore.jobs.filter(j => j.status === 'Applied').length },
  { label: 'Interview', count: jobStore.jobs.filter(j => j.status === 'Interview').length },
  { label: 'Offers', count: jobStore.jobs.filter(j => j.status === 'Offer').length }
])

const visiblePages = computed(() => {
  const current = jobStore.currentPage
  const total = jobStore.totalPages
  const pages: number[] = []
  
  // Always show first page
  pages.push(1)
  
  // Show pages around current page
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    if (!pages.includes(i)) {
      pages.push(i)
    }
  }
  
  // Always show last page
  if (total > 1 && !pages.includes(total)) {
    pages.push(total)
  }
  
  return pages.sort((a, b) => a - b)
})

const handleSync = async () => {
  await syncStore.syncAll()
}

const changePage = async (page: number) => {
  if (page >= 1 && page <= jobStore.totalPages) {
    await jobStore.fetchJobs(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

onMounted(async () => {
  // Fetch initial data
  await Promise.all([
    jobStore.fetchJobs(1),
    statusStore.fetchStatuses(),
    platformStore.fetchPlatforms()
  ])
})
</script>