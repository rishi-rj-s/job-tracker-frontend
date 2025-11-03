<template>
  <div v-if="showPagination" class="flex justify-between items-center bg-white p-5 border-t border-gray-200 shadow-lg">
    <div class="text-sm text-gray-600">
      Showing page <span class="font-bold text-gray-800">{{ jobStore.currentPage }}</span> of
      <span class="font-bold text-gray-800">{{ jobStore.totalPages }}</span>
      (Total Applications: <span class="font-bold text-gray-800">{{ jobStore.totalItems }}</span>)
    </div>
    <div class="flex space-x-3">
      <button @click="goToPage(jobStore.currentPage - 1)"
              :disabled="jobStore.currentPage === 1"
              :class="['transition duration-200 bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg text-sm',
                       jobStore.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600 shadow-md']">
        &lt; Prev Page
      </button>
      <span class="px-4 py-2 text-sm font-bold text-gray-700 bg-gray-100 border border-gray-300 rounded-lg flex items-center">
        {{ jobStore.currentPage }}
      </span>
      <button @click="goToPage(jobStore.currentPage + 1)"
              :disabled="jobStore.currentPage >= jobStore.totalPages"
              :class="['transition duration-200 bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg text-sm',
                       jobStore.currentPage >= jobStore.totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600 shadow-md']">
        Next Page &gt;
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useJobStore } from '../../stores/jobStore'

const jobStore = useJobStore()

const showPagination = computed(() => {
  return jobStore.totalPages > 1 || jobStore.totalItems > jobStore.pageSize
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= jobStore.totalPages) {
    jobStore.fetchJobs(page)
  }
}
</script>