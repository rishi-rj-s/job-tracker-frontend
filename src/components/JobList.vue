<template>
  <div>
    <div v-if="jobStore.isLoading" class="p-8 text-center">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p class="mt-4 text-gray-600">Loading applications...</p>
    </div>

    <div v-else-if="jobStore.jobs.length === 0" class="p-8 text-center text-gray-500">
      <p class="text-lg font-semibold">No applications found</p>
      <p class="text-sm mt-2">Add your first job application above to get started!</p>
    </div>

    <div v-else>
      <div class="hidden md:grid md:grid-cols-[1.5fr_1fr_1fr_100px_100px_160px_60px] md:gap-4 p-4 bg-blue-50 font-bold text-sm text-gray-700 border-b-2 border-blue-200">
        <div>Job Title / Company</div>
        <div>Link / Notes / Salary</div>
        <div>Location</div>
        <div>Applied</div>
        <div>Next Action</div>
        <div>Status</div>
        <div class="text-center">Actions</div>
      </div>

      <JobRow v-for="job in jobStore.jobs" :key="job._id || job.id" :job="job" />
    </div>
  </div>
</template>

<script setup lang="ts">
import JobRow from './JobRow.vue'
import { useJobStore } from '../stores/jobStore'

const jobStore = useJobStore()
</script>