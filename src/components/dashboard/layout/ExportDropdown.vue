<template>
  <div class="relative" ref="dropdownRef">
    <button
      @click="isOpen = !isOpen"
      class="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
    >
      <Download class="h-4 w-4" />
      Export
      <ChevronDown class="h-4 w-4" />
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
    >
      <button
        @click="handleExport('csv')"
        class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
      >
        <FileSpreadsheet class="h-4 w-4" />
        Export as CSV
      </button>
      <button
        @click="handleExport('xlsx')"
        class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
      >
        <FileSpreadsheet class="h-4 w-4" />
        Export as Excel
      </button>
      <button
        @click="handleExport('pdf')"
        class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
      >
        <FileText class="h-4 w-4" />
        Export as PDF
      </button>
      <button
        @click="handleExport('json')"
        class="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
      >
        <FileJson class="h-4 w-4" />
        Export as JSON
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Download, ChevronDown, FileSpreadsheet, FileJson, FileText } from 'lucide-vue-next'
import { useJobStore } from '@stores/jobStore'
import { useToast } from '@composables/useToast'

const jobStore = useJobStore()
const { showToast } = useToast()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const handleExport = async (format: 'csv' | 'xlsx' | 'pdf' | 'json') => {
  isOpen.value = false
  const result = await jobStore.exportJobs(format)
  
  if (result.success) {
    showToast(result.message || 'Export successful!', 'green')
  } else {
    showToast(result.message || 'Export failed', 'red')
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
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