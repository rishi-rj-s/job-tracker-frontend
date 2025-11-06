<template>
  <div class="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-100">
    <h2 class="text-2xl font-bold text-blue-700 mb-4 pb-2 border-b border-gray-200">Log New Application</h2>
    <p class="text-sm text-gray-600 mb-4">Fill out this form each time you send out a job application</p>

    <form @submit.prevent="handleSubmit" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      
      <div class="lg:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="col-span-full md:col-span-1">
          <label for="jobTitle" class="block text-sm font-medium text-gray-700">Job Title <span class="text-red-500">*</span></label>
          <input v-model="formData.jobTitle" type="text" id="jobTitle" required
                 class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500">
        </div>

        <div class="col-span-full md:col-span-1">
          <label for="company" class="block text-sm font-medium text-gray-700">Company Name <span class="text-red-500">*</span></label>
          <input v-model="formData.company" type="text" id="company" required
                 class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500">
        </div>

        <div class="col-span-full md:col-span-1">
          <label for="dateApplied" class="block text-sm font-medium text-gray-700">Date Applied <span class="text-red-500">*</span></label>
          <input v-model="formData.dateApplied" type="date" id="dateApplied" required
                 class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500 h-10">
        </div>

        <div class="col-span-full md:col-span-1">
          <StatusDropdown v-model="formData.status" form-id="job-form" />
        </div>
      </div>

      <div class="lg:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label for="jobLink" class="block text-sm font-medium text-gray-700">Job Link (URL)</label>
          <input v-model="formData.jobLink" type="url" id="jobLink"
                 class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500">
        </div>

        <div>
          <label for="salary" class="block text-sm font-medium text-gray-700">Salary/Compensation</label>
          <input v-model="formData.salary" type="text" id="salary" placeholder="e.g., $120,000"
                 class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500">
        </div>

        <div>
          <label for="location" class="block text-sm font-medium text-gray-700">Location</label>
          <input v-model="formData.location" type="text" id="location" placeholder="e.g., Remote, San Francisco"
                 class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500">
        </div>

        <div>
          <label for="nextActionDate" class="block text-sm font-medium text-gray-700">Next Action Date</label>
          <input v-model="formData.nextActionDate" type="date" id="nextActionDate"
                 class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500">
        </div>
      </div>

      <div class="col-span-full">
        <PlatformDropdown v-model="formData.applicationPlatforms" form-id="job-form" />
      </div>

      <div class="col-span-full">
        <label for="notes" class="block text-sm font-medium text-gray-700">Notes</label>
        <textarea v-model="formData.notes" id="notes" rows="2"
                  class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"></textarea>
      </div>

      <div class="col-span-full flex justify-end">
        <button type="submit"
                class="w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-200 flex items-center justify-center">
          <Plus class="h-5 w-5 mr-2" />
          Log Application
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from 'lucide-vue-next'
import StatusDropdown from '@/components/common/StatusDropdown.vue'
import PlatformDropdown from '@/components/common/PlatformDropdown.vue'
import { useJobStore } from '@/stores/jobStore'
import { useStatusStore } from '@/stores/statusStore'
import { usePlatformStore } from '@/stores/platformStore'
import { useToast } from '@/composables/useToast'
import type { Job } from '@type/index'

const emit = defineEmits<{
  submitted: []
}>()

const jobStore = useJobStore()
const statusStore = useStatusStore()
const platformStore = usePlatformStore()
const { showToast } = useToast()

const formData = ref<Job>({
  jobTitle: '',
  company: '',
  dateApplied: '',
  jobLink: '',
  salary: '',
  location: '',
  status: 'applied',
  nextActionDate: '',
  notes: '',
  applicationPlatforms: []
})

const handleSubmit = () => {
  if (!formData.value.jobTitle || !formData.value.company || !formData.value.dateApplied) {
    showToast('Please fill in Job Title, Company, and Date Applied', 'red')
    return
  }

  if (!formData.value.applicationPlatforms || formData.value.applicationPlatforms.length === 0) {
    showToast('Please select at least one application platform', 'red')
    return
  }

  // Check if stores have data
  if (Object.keys(statusStore.statuses).length === 0) {
    showToast('Status data not loaded. Please refresh the page', 'red')
    return
  }

  if (Object.keys(platformStore.platforms).length === 0) {
    showToast('Platform data not loaded. Please refresh the page', 'red')
    return
  }

  try {
    jobStore.addJob(formData.value)
    showToast('Application logged successfully!', 'green')

    // Reset form
    formData.value = {
      jobTitle: '',
      company: '',
      dateApplied: '',
      jobLink: '',
      salary: '',
      location: '',
      status: 'applied',
      nextActionDate: '',
      notes: '',
      applicationPlatforms: []
    }

    // Emit submitted event to close form
    emit('submitted')
  } catch (error) {
    showToast('Failed to add application. Please try again', 'red')
  }
}
</script>