<template>
  <Teleport to="body">
    <div v-if="isOpen" @click="closeModal"
         class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center transition-opacity duration-300"
         style="background-color: rgba(0, 0, 0, 0.5)">
      <div @click.stop class="bg-white rounded-xl shadow-2xl w-full max-w-3xl m-4 md:m-8 p-6 transform transition-all duration-300">
        <div class="flex justify-between items-start border-b pb-3 mb-4">
          <h2 class="text-2xl font-bold text-blue-700">Edit Application</h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition">
            <X class="h-6 w-6" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          <div class="lg:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="col-span-full md:col-span-1">
              <label for="edit-jobTitle" class="block text-sm font-medium text-gray-700">Job Title <span class="text-red-500">*</span></label>
              <input v-model="formData.jobTitle" type="text" id="edit-jobTitle" required
                     class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500">
            </div>

            <div class="col-span-full md:col-span-1">
              <label for="edit-company" class="block text-sm font-medium text-gray-700">Company Name <span class="text-red-500">*</span></label>
              <input v-model="formData.company" type="text" id="edit-company" required
                     class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500">
            </div>

            <div class="col-span-full md:col-span-1">
              <label for="edit-dateApplied" class="block text-sm font-medium text-gray-700">Date Applied <span class="text-red-500">*</span></label>
              <input v-model="formData.dateApplied" type="date" id="edit-dateApplied" required
                     class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500 h-10">
            </div>

            <div class="col-span-full md:col-span-1">
              <StatusDropdown v-model="formData.status" form-id="edit-job-form" />
            </div>
          </div>

          <div class="lg:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label for="edit-jobLink" class="block text-sm font-medium text-gray-700">Job Link (URL)</label>
              <input v-model="formData.jobLink" type="url" id="edit-jobLink"
                     class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500">
            </div>

            <div>
              <label for="edit-salary" class="block text-sm font-medium text-gray-700">Salary/Compensation</label>
              <input v-model="formData.salary" type="text" id="edit-salary" placeholder="e.g., $120,000"
                     class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500">
            </div>

            <div>
              <label for="edit-location" class="block text-sm font-medium text-gray-700">Location</label>
              <input v-model="formData.location" type="text" id="edit-location" placeholder="e.g., Remote, San Francisco"
                     class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500">
            </div>

            <div>
              <label for="edit-nextActionDate" class="block text-sm font-medium text-gray-700">Next Action Date</label>
              <input v-model="formData.nextActionDate" type="date" id="edit-nextActionDate"
                     class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500">
            </div>
          </div>

          <div class="col-span-full">
            <PlatformDropdown v-model="formData.applicationPlatforms" form-id="edit-job-form" />
          </div>

          <div class="col-span-full">
            <label for="edit-notes" class="block text-sm font-medium text-gray-700">Notes</label>
            <textarea v-model="formData.notes" id="edit-notes" rows="2"
                      class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"></textarea>
          </div>

          <div class="col-span-full flex justify-end mt-4">
            <button type="submit"
                    class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-200 flex items-center">
              <Check class="h-5 w-5 mr-2" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { X, Check } from 'lucide-vue-next'
import StatusDropdown from '@/components/common/StatusDropdown.vue'
import PlatformDropdown from '@/components/common/PlatformDropdown.vue'
import { useJobStore } from '@/stores/jobStore'
import { useStatusStore } from '@/stores/statusStore'
import { usePlatformStore } from '@/stores/platformStore'
import { useToast } from '@/composables/useToast'
import type { Job } from '@type/index'

const jobStore = useJobStore()
const statusStore = useStatusStore()
const platformStore = usePlatformStore()
const { showToast } = useToast()

const isOpen = ref(false)
const currentJobId = ref<string>('')

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

const openModal = (event: Event) => {
  const customEvent = event as CustomEvent<Job>
  const job = customEvent.detail

  console.log('📝 Opening edit modal for job:', job)
  console.log('📊 Available statuses:', Object.keys(statusStore.statuses))
  console.log('📊 Available platforms:', Object.keys(platformStore.platforms))

  currentJobId.value = job._id || job.id || ''
  
  // Normalize status to lowercase for consistency
  const normalizedStatus = (job.status || 'applied').toLowerCase()
  
  formData.value = {
    jobTitle: job.jobTitle || '',
    company: job.company || '',
    dateApplied: job.dateApplied ? job.dateApplied.substring(0, 10) : '',
    jobLink: job.jobLink || '',
    salary: job.salary || '',
    location: job.location || '',
    status: normalizedStatus,
    nextActionDate: job.nextActionDate ? job.nextActionDate.substring(0, 10) : '',
    notes: job.notes || '',
    applicationPlatforms: job.applicationPlatforms || []
  }

  console.log('✅ Form data set with status:', formData.value.status)

  isOpen.value = true
}

const closeModal = () => {
  isOpen.value = false
}

const handleSubmit = () => {
  if (!formData.value.jobTitle || !formData.value.company || !formData.value.dateApplied) {
    showToast('Job Title, Company, and Date Applied are required.', 'red')
    return
  }

  if (!formData.value.applicationPlatforms || formData.value.applicationPlatforms.length === 0) {
    showToast('Please select at least one application platform.', 'red')
    return
  }

  // Check if stores have data
  if (Object.keys(statusStore.statuses).length === 0) {
    showToast('Status data not loaded. Please refresh the page.', 'red')
    console.error('❌ Status store is empty!')
    return
  }

  if (Object.keys(platformStore.platforms).length === 0) {
    showToast('Platform data not loaded. Please refresh the page.', 'red')
    console.error('❌ Platform store is empty!')
    return
  }

  jobStore.updateJob(currentJobId.value, formData.value)
  showToast(`Job updated instantly! Click 'Sync Data' to save to backend.`, 'blue')
  closeModal()
}

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    closeModal()
  }
}

onMounted(() => {
  console.log('🔧 Edit modal mounted')
  console.log('📊 Statuses available:', Object.keys(statusStore.statuses).length)
  console.log('📊 Platforms available:', Object.keys(platformStore.platforms).length)
  
  window.addEventListener('open-edit-modal', openModal as EventListener)
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  window.removeEventListener('open-edit-modal', openModal as EventListener)
  document.removeEventListener('keydown', handleEscape)
})
</script>