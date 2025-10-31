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

    <!-- Add Job Form Toggle Button & Form -->
    <div class="space-y-4">
      <button
        @click="showForm = !showForm"
        class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md"
      >
        <Plus class="h-5 w-5" />
        {{ showForm ? 'Hide Form' : 'Add New Application' }}
      </button>

      <transition name="slide-fade">
        <JobForm v-if="showForm" @submitted="showForm = false" />
      </transition>
    </div>

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

    <!-- Search & Filter Section -->
    <SearchBar />

    <!-- Jobs List -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <JobList />
    </div>

    <!-- Pagination -->
    <Pagination v-if="jobStore.totalPages > 1" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RefreshCw, Plus } from 'lucide-vue-next'
import { useJobStore } from '@stores/jobStore'
import { useSyncStore } from '@stores/syncStore'
import { useStatusStore } from '@stores/statusStore'
import { usePlatformStore } from '@stores/platformStore'
import JobForm from '@components/dashboard/jobs/JobForm.vue'
import JobList from '@components/dashboard/jobs/JobList.vue'
import EditModal from '@components/dashboard/jobs/EditModal.vue'
import Pagination from '@components/common/Pagination.vue'
import SearchBar from '@components/dashboard/jobs/SearchBar.vue'


const jobStore = useJobStore()
const syncStore = useSyncStore()
const statusStore = useStatusStore()
const platformStore = usePlatformStore()

const showForm = ref(false)

const statusStats = computed(() => [
  { label: 'Total', count: jobStore.jobs.length },
  { label: 'Applied', count: jobStore.jobs.filter(j => j.status === 'Applied').length },
  { label: 'Interview', count: jobStore.jobs.filter(j => j.status === 'Interview').length },
  { label: 'Offers', count: jobStore.jobs.filter(j => j.status === 'Offer').length }
])

const handleSync = async () => {
  await syncStore.syncAll()
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

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
  transform: translateY(-20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>