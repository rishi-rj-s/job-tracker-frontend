<template>
  <div
    :class="['job-row w-full p-4 bg-white md:grid md:grid-cols-[1.5fr_1fr_1fr_100px_100px_160px_60px] md:gap-4 last:border-b-0', rowClass, pendingStyle]">

    <div class="mb-2 md:mb-0 space-y-0.5">
      <div class="font-semibold text-base text-gray-800 flex items-center">
        {{ job.jobTitle || 'N/A' }}
        <span v-if="isPending"
          class="text-yellow-700 font-semibold text-xs flex items-center ml-2 bg-yellow-100 p-1 rounded-full px-2 shadow-sm">
          <RefreshCw class="h-4 w-4 mr-1 animate-spin" />
          Pending Sync
        </span>
      </div>
      <div class="text-gray-600 text-sm">{{ job.company || 'N/A' }}</div>
      <div class="text-xs mt-1 flex flex-wrap gap-1">
        <span v-for="platform in job.applicationPlatforms" :key="platform"
          :class="['inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold', getPlatformClass(platform)]">
          {{ platformStore.platforms[platform] || platform }}
        </span>
        <span v-if="!job.applicationPlatforms || job.applicationPlatforms.length === 0"
          class="text-gray-400 italic text-xs">
          No platforms
        </span>
      </div>
    </div>

    <div class="mb-2 md:mb-0 text-sm space-y-1">
      <div>
        <a v-if="job.jobLink" :href="job.jobLink" target="_blank"
          class="text-indigo-600 hover:text-indigo-800 font-medium truncate flex items-center text-sm"
          :title="job.jobTitle">
          <ExternalLink class="h-4 w-4 mr-1" />
          Job Post
        </a>
        <span v-else class="text-gray-400 italic text-sm">No Link</span>
      </div>
      <div class="text-xs text-gray-500 italic max-h-10 overflow-hidden line-clamp-2" :title="job.notes">
        <span class="md:hidden font-semibold not-italic text-gray-700">Notes: </span>
        {{ job.notes || 'No notes provided.' }}
      </div>
      <div class="font-medium text-gray-700 text-sm">{{ job.salary || 'Negotiable' }}</div>
    </div>

    <div class="mb-2 md:mb-0 text-sm text-gray-500 flex items-center">
      {{ job.location || 'Remote/Unknown' }}
    </div>

    <div class="mb-2 md:mb-0 text-sm text-gray-700 font-medium flex items-center">
      <span class="md:hidden font-semibold mr-2">Applied: </span>
      {{ formatDate(job.dateApplied) }}
    </div>

    <div class="mb-2 md:mb-0 text-sm text-gray-700 font-medium flex items-center">
      <span class="md:hidden font-semibold mr-2">Next Action: </span>
      {{ formatDate(job.nextActionDate) }}
    </div>

    <div class="mb-4 md:mb-0 flex items-center">
      <label class="md:hidden font-semibold text-sm mr-2 text-gray-700">Update Status:</label>
      <select v-model="selectedStatus" @change="updateStatus" :class="['w-full focus:ring-2 focus:ring-opacity-50 focus:ring-blue-500 h-10 rounded-full px-3 py-2 text-sm font-semibold cursor-pointer border transition-all appearance-none bg-no-repeat bg-right pr-8',
        getStatusClass(selectedStatus)]" :style="{
                  backgroundImage: `url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 20 20%27 fill=%27none%27%3e%3cpath fill=%27%236B7280%27 d=%27M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z%27/%3e%3c/svg%3e')`,
                  backgroundSize: '1.2em',
                  backgroundPosition: 'right 0.5rem center'
                }">
        <option v-for="(name, key) in statusStore.statuses" :key="key" :value="key">
          {{ name }}
        </option>
      </select>
    </div>

    <div class="flex justify-end md:justify-center items-center space-x-2 h-full">
      <button @click="openEdit" class="text-blue-500 hover:text-blue-700 p-1 rounded-full transition duration-150"
        title="Edit Application">
        <Edit class="h-5 w-5" />
      </button>

      <button v-if="!showConfirm" @click="showConfirm = true"
        class="text-red-500 hover:text-red-700 p-1 rounded-full transition duration-150" title="Delete Application">
        <Trash2 class="h-5 w-5" />
      </button>

      <div v-else class="flex items-center space-x-1">
        <button @click="confirmDelete"
          class="text-white bg-red-600 hover:bg-red-700 px-2 py-1 text-xs rounded-lg transition duration-150">
          Confirm?
        </button>
        <button @click="showConfirm = false"
          class="text-gray-800 bg-gray-300 hover:bg-gray-400 px-2 py-1 text-xs rounded-lg transition duration-150">
          Cancel
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RefreshCw, ExternalLink, Edit, Trash2 } from 'lucide-vue-next'
import type { Job } from '@type/index'
import { useJobStore } from '@stores/jobStore'
import { useStatusStore } from '@stores/statusStore'
import { usePlatformStore } from '@stores/platformStore'
import { useToast } from '@composables/useToast'

const props = defineProps<{
  job: Job
}>()

const emit = defineEmits<{
  edit: [job: Job]
}>()

const jobStore = useJobStore()
const statusStore = useStatusStore()
const platformStore = usePlatformStore()
const { showToast } = useToast()

const showConfirm = ref(false)
const selectedStatus = ref(props.job.status || 'Applied')

const isPending = computed(() => props.job.isPending)

const rowClass = computed(() => {
  const classes: Record<string, string> = {
    'Applied': 'status-Applied',
    'Screening': 'status-Screening',
    'Interview': 'status-Interview',
    'Offer': 'status-Offer',
    'Rejected': 'status-Rejected',
    'Closed': 'status-Closed',
  }
  return classes[props.job.status] || 'status-Custom'
})

const pendingStyle = computed(() => {
  return isPending.value ? 'opacity-80 border-l-4 border-yellow-500' : ''
})

const getStatusClass = (key: string) => {
  const classes: Record<string, string> = {
    'Applied': 'status-Applied-bg',
    'Screening': 'status-Screening-bg',
    'Interview': 'status-Interview-bg',
    'Offer': 'status-Offer-bg',
    'Rejected': 'status-Rejected-bg',
    'Closed': 'status-Closed-bg',
  }
  return classes[key] || 'status-Custom-bg'
}

const getPlatformClass = (key: string) => {
  const classes: Record<string, string> = {
    'linkedin': 'platform-linkedin',
    'company-website': 'platform-company',
    'hr-email': 'platform-email',
    'whatsapp': 'platform-whatsapp',
    'recruiter': 'platform-other',
    'other': 'platform-other'
  }
  return classes[key] || 'platform-other'
}

const formatDate = (date?: string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

const updateStatus = () => {
  const jobId = props.job._id || props.job.id!
  jobStore.updateJob(jobId, { status: selectedStatus.value })
  showToast(`Job updated instantly! Status changed. Click 'Sync Data' to save to backend.`, 'blue')
}

const openEdit = () => {
  const editEvent = new CustomEvent('open-edit-modal', { detail: props.job })
  window.dispatchEvent(editEvent)
}

const confirmDelete = () => {
  const jobId = props.job._id || props.job.id!
  jobStore.deleteJob(jobId)
  showToast("Application deleted instantly! Click 'Sync Data' to confirm delete.", 'red')
  showConfirm.value = false
}
</script>