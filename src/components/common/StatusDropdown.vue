<template>
  <div :data-status-dropdown="formId">
    <label class="block text-sm font-medium text-gray-700">Status <span class="text-red-500">*</span></label>
    
    <div class="relative" @click.stop>
      <button type="button" @click="toggleDropdown"
              class="mt-1 w-full h-10 px-3 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center justify-between text-sm">
        <div class="flex items-center overflow-hidden">
          <span v-if="modelValue" :class="['inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold', getStatusClass(modelValue)]">
            {{ statusStore.statuses[modelValue] }}
          </span>
          <span v-else class="text-sm text-gray-500 italic">Select a status</span>
        </div>
        <ChevronDown class="h-5 w-5 text-gray-400 shrink-0 ml-2" />
      </button>

      <div v-if="isOpen" class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden flex flex-col">
        <div class="p-3 border-b border-gray-200">
          <input v-model="searchQuery" type="text" placeholder="Search or create new status..."
                 class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <div class="overflow-y-auto">
          <div v-if="filteredStatuses.length === 0 && !searchQuery" class="px-4 py-3 text-sm text-gray-500 text-center">
            No statuses available
          </div>

          <div v-else-if="filteredStatuses.length === 0 && searchQuery" class="px-4 py-3 text-center">
            <p class="text-sm text-gray-500 mb-2">No status found</p>
            <button type="button" @click="createStatus"
                    class="text-sm bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition font-medium inline-flex items-center">
              <Plus class="h-4 w-4 mr-1" />
              Create "{{ searchQuery }}"
            </button>
          </div>

          <div v-else>
            <div v-for="[key, name] in filteredStatuses" :key="key"
                 @click="selectStatus(key)"
                 class="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition"
                 :class="{ 'bg-blue-50': modelValue === key }">
              <div class="flex items-center flex-1">
                <span :class="['inline-block px-3 py-1 rounded-full text-xs font-semibold mr-2', getStatusClass(key)]">
                  {{ name }}
                </span>
                <Check v-if="modelValue === key" class="h-4 w-4 text-blue-600" />
              </div>
              <button v-if="!statusStore.isDefaultStatus(key)" type="button"
                      @click.stop="deleteStatusHandler(key)"
                      class="ml-2 text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition"
                      title="Delete Status">
                <Trash2 class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronDown, Check, Plus, Trash2 } from 'lucide-vue-next'
import { useStatusStore } from '@/stores/statusStore'
import { useToast } from '@/composables/useToast'

const props = defineProps<{
  modelValue: string
  formId: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const statusStore = useStatusStore()
const { showToast } = useToast()

const isOpen = ref(false)
const searchQuery = ref('')

const filteredStatuses = computed(() => {
  const query = searchQuery.value.toLowerCase()
  return Object.entries(statusStore.statuses).filter(([key, name]) =>
    name.toLowerCase().includes(query) || key.toLowerCase().includes(query)
  )
})

const getStatusClass = (key: string) => {
  const classes: Record<string, string> = {
    'Applied': 'status-Applied-bg',
    'applied': 'status-Applied-bg',
    'Screening': 'status-Screening-bg',
    'screening': 'status-Screening-bg',
    'Interview': 'status-Interview-bg',
    'interview': 'status-Interview-bg',
    'Offer': 'status-Offer-bg',
    'offer': 'status-Offer-bg',
    'Rejected': 'status-Rejected-bg',
    'rejected': 'status-Rejected-bg',
    'Closed': 'status-Closed-bg',
    'closed': 'status-Closed-bg',
  }
  return classes[key] || 'status-Custom-bg'
}

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
  }
}

const selectStatus = (key: string) => {
  emit('update:modelValue', key)
  isOpen.value = false
}

// ✅ FIX: Preserve original user input for name
const createStatus = async () => {
  if (!searchQuery.value.trim()) return

  const originalName = searchQuery.value.trim() // Keep original capitalization
  const result = await statusStore.addStatus(originalName)
  
  if (!result.success) {
    showToast(result.message || 'Failed to create status', 'red')
    return
  }

  // Select the newly created status
  emit('update:modelValue', result.key!)
  isOpen.value = false
  showToast(`Status "${originalName}" created! Click 'Sync Data' to save.`, 'blue')
}

const deleteStatusHandler = async (key: string) => {
  const result = await statusStore.deleteStatus(key)
  
  if (!result.success) {
    showToast(result.message || 'Cannot delete this status', 'red')
    return
  }

  // If deleted status was selected, reset to default
  if (props.modelValue === key) {
    emit('update:modelValue', 'applied')
  }

  showToast('Status deleted successfully!', 'green')
}

const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest(`[data-status-dropdown="${props.formId}"]`)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>