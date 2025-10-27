<template>
  <div class="p-4 sm:p-10">
    <Toast />

    <div class="max-w-7xl mx-auto">
      <header class="mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-1">Job Application Tracker</h1>
        <p class="text-gray-500 text-md">Track your applications with custom statuses and platforms</p>
      </header>

      <div v-if="jobStore.connectionStatus === 'loading'"
           class="p-4 mb-8 text-lg font-semibold text-gray-800 rounded-lg shadow-md bg-yellow-100 border border-yellow-300">
        Attempting connection to Supabase...
      </div>

      <div v-if="jobStore.connectionStatus === 'success'"
           class="p-4 mb-8 text-lg font-semibold text-white rounded-lg shadow-md bg-green-600">
        Connection successful! Supabase is connected.
      </div>

      <div v-if="jobStore.connectionStatus === 'error'"
           class="p-4 mb-8 text-lg font-semibold text-white rounded-lg shadow-md bg-red-700">
        CONNECTION FAILED: {{ jobStore.errorMessage }}. Please check your Supabase configuration.
      </div>

      <JobForm />

      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-gray-800">Tracked Applications</h2>
        <button v-if="jobStore.hasPendingChanges"
                @click="syncStore.syncAll()"
                class="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200 flex items-center text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1 animate-spin" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0110.803 6.948A7.001 7.001 0 0110 18a7.001 7.001 0 01-6.803-5.95l1.83.61c.453.15.938-.077 1.088-.53l.61-1.83c.15-.453-.077-.938-.53-1.088l-1.83-.61c.49-.33.992-.61 1.504-.84a.998.998 0 011.088.53l.61 1.83c.15.453-.077.938-.53 1.088l-1.83.61A6.002 6.002 0 0010 17a6.002 6.002 0 005.654-4.524 1 1 0 00-1.92-0.518A4.997 4.997 0 0110 14a5.002 5.002 0 01-4.757-3.328 1 1 0 00-1.088-.53l-1.83.61A7.002 7.002 0 015 3a1 1 0 011-1h4z" clip-rule="evenodd" />
          </svg>
          Sync Data ({{ jobStore.pendingCount }})
        </button>
      </div>

      <div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <JobList />
        <Pagination />
      </div>
    </div>

    <EditModal />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import JobForm from './components/JobForm.vue'
import JobList from './components/JobList.vue'
import Pagination from './components/Pagination.vue'
import EditModal from './components/EditModal.vue'
import Toast from './components/Toast.vue'
import { useJobStore } from './stores/jobStore'
import { useStatusStore } from './stores/statusStore'
import { usePlatformStore } from './stores/platformStore'
import { useSyncStore } from './stores/syncStore'

const jobStore = useJobStore()
const statusStore = useStatusStore()
const platformStore = usePlatformStore()
const syncStore = useSyncStore()

onMounted(async () => {
  await statusStore.fetchStatuses()
  await platformStore.fetchPlatforms()
  await jobStore.fetchJobs(1)
})
</script>