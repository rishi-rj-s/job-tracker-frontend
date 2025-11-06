<template>
  <div :data-platform-dropdown="formId">
    <label class="block text-sm font-medium text-gray-700 mb-2">
      Application Platforms <span class="text-red-500">*</span>
    </label>
    
    <!-- Selected platforms display -->
    <div class="mb-3 min-h-8">
      <p v-if="modelValue.length === 0" class="text-sm text-gray-500 italic">
        No platforms selected
      </p>
      <div v-else class="flex flex-wrap gap-2">
        <div 
          v-for="platformKey in modelValue" 
          :key="platformKey"
          :class="[
            'inline-flex items-center px-3.5 py-2 rounded-full text-sm font-semibold',
            'transition-all hover:translate-y-px hover:shadow-md cursor-default',
            getPlatformClass(platformKey)
          ]"
        >
          <span>{{ platformStore.platforms[platformKey] || platformKey }}</span>
          <button 
            type="button" 
            @click="removePlatform(platformKey)"
            class="ml-2 w-4 h-4 flex items-center justify-center rounded-full hover:bg-black hover:bg-opacity-20 transition-all hover:scale-110"
            title="Remove platform"
          >
            <X class="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>

    <!-- Dropdown trigger -->
    <div class="relative" @click.stop>
      <button 
        type="button" 
        @click="toggleDropdown"
        class="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between text-sm text-gray-700"
      >
        <span>+ Add/Select Platforms</span>
        <ChevronDown :class="['h-5 w-5 text-gray-400 transition-transform', isOpen && 'rotate-180']" />
      </button>

      <!-- Dropdown menu -->
      <div 
        v-if="isOpen" 
        class="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50"
      >
        <!-- Search input -->
        <div class="p-3 border-b border-gray-200">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search or create new platform..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            @keyup.enter="createPlatform"
          />
        </div>

        <!-- Platforms list -->
        <div class="max-h-64 overflow-y-auto">
          <!-- Empty state - no platforms exist -->
          <div 
            v-if="sortedPlatforms.length === 0 && !searchQuery" 
            class="px-4 py-3 text-sm text-gray-500 text-center"
          >
            No platforms available
          </div>

          <!-- No search results - offer to create -->
          <div 
            v-else-if="sortedPlatforms.length === 0 && searchQuery" 
            class="px-4 py-3 text-center"
          >
            <p class="text-sm text-gray-500 mb-2">No platforms found</p>
            <button 
              type="button" 
              @click="createPlatform"
              class="text-sm bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition font-medium inline-flex items-center"
            >
              <Plus class="h-4 w-4 mr-1" />
              Create "{{ searchQuery }}"
            </button>
          </div>

          <!-- Platform items -->
          <div v-else>
            <div 
              v-for="[key, name] in sortedPlatforms" 
              :key="key"
              class="flex items-center justify-between px-4 py-2 border-b border-gray-100 last:border-b-0 transition hover:bg-gray-50"
              :class="{ 'bg-blue-50': modelValue.includes(key) }"
            >
              <!-- Checkbox + label -->
              <label class="flex items-center flex-1 cursor-pointer">
                <input 
                  type="checkbox" 
                  :checked="modelValue.includes(key)" 
                  @change="togglePlatform(key)"
                  class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span 
                  :class="[
                    'ml-3 text-sm font-medium',
                    modelValue.includes(key) ? 'text-blue-700 font-semibold' : 'text-gray-700'
                  ]"
                >
                  {{ name }}
                </span>
                <Check v-if="modelValue.includes(key)" class="h-4 w-4 ml-2 text-blue-600" />
              </label>

              <!-- Delete button (only for custom platforms) -->
              <button 
                v-if="!platformStore.isDefaultPlatform(key)" 
                type="button"
                @click.stop="deletePlatformHandler(key)"
                class="ml-2 text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition"
                title="Delete Platform"
              >
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
import { ChevronDown, Check, Plus, Trash2, X } from 'lucide-vue-next'
import { usePlatformStore } from '@/stores/platformStore'
import { useToast } from '@/composables/useToast'

const props = defineProps<{
  modelValue: string[]
  formId: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const platformStore = usePlatformStore()
const { showToast } = useToast()

const isOpen = ref(false)
const searchQuery = ref('')

// Filter platforms based on search query
const filteredPlatforms = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) {
    return Object.entries(platformStore.platforms)
  }
  
  return Object.entries(platformStore.platforms).filter(([key, name]) =>
    name.toLowerCase().includes(query) || key.toLowerCase().includes(query)
  )
})

// Sort platforms: selected first, then unselected
const sortedPlatforms = computed(() => {
  const selected = filteredPlatforms.value.filter(([key]) => props.modelValue.includes(key))
  const unselected = filteredPlatforms.value.filter(([key]) => !props.modelValue.includes(key))
  return [...selected, ...unselected]
})

// Get CSS class for platform badge
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

// Toggle dropdown open/closed
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
  }
}

// Toggle platform selection
const togglePlatform = (key: string) => {
  const index = props.modelValue.indexOf(key)
  const newValue = [...props.modelValue]

  if (index > -1) {
    newValue.splice(index, 1)
    showToast(`Platform removed from selection`, 'gray')
  } else {
    newValue.push(key)
    showToast(`Platform added to selection`, 'blue')
  }

  emit('update:modelValue', newValue)
}

// Remove platform from selected list
const removePlatform = (key: string) => {
  const newValue = props.modelValue.filter(p => p !== key)
  emit('update:modelValue', newValue)
  showToast(`Platform removed from selection`, 'gray')
}

// Create new custom platform
const createPlatform = async () => {
  const trimmedQuery = searchQuery.value.trim()
  
  if (!trimmedQuery) {
    showToast('Please enter a platform name', 'orange')
    return
  }

  // Check if platform already exists
  const existingKey = platformStore.createPlatformKey(trimmedQuery)
  if (platformStore.platforms[existingKey]) {
    showToast('This platform already exists!', 'orange')
    return
  }

  const result = await platformStore.addPlatform(trimmedQuery)
  
  if (!result.success) {
    showToast(result.message || 'Failed to create platform', 'red')
    return
  }

  if (!result.key) {
    showToast('Failed to create platform - no key returned', 'red')
    return
  }

  // Add to selection immediately
  const newValue = [...props.modelValue, result.key]
  emit('update:modelValue', newValue)
  
  searchQuery.value = ''
  showToast(`Platform "${trimmedQuery}" created! Click "Sync Data" to save permanently.`, 'green')
}

// Delete custom platform
const deletePlatformHandler = async (key: string) => {
  const platformName = platformStore.platforms[key]
  
  if (platformStore.isDefaultPlatform(key)) {
    showToast('Cannot delete default platform', 'red')
    return
  }

  const result = await platformStore.deletePlatform(key)
  
  if (!result.success && !result.requiresSync) {
    showToast(result.message || 'Failed to delete platform', 'red')
    return
  }

  // Remove from selection if it was selected
  if (props.modelValue.includes(key)) {
    removePlatform(key)
  }

  // Show appropriate toast
  if (result.requiresSync) {
    showToast(`Platform "${platformName}" deleted! Click "Sync Data" to save permanently.`, 'orange')
  } else {
    showToast(`Platform "${platformName}" deleted successfully!`, 'green')
  }
}

// Close dropdown when clicking outside
const handleClickOutside = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest(`[data-platform-dropdown="${props.formId}"]`)) {
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