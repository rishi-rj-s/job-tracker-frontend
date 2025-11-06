<template>
  <header class="bg-white border-b border-gray-200 sticky top-0 z-30">
    <div class="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
      <!-- Mobile Menu Button -->
      <button
        @click="$emit('toggle-sidebar')"
        class="lg:hidden text-gray-600 hover:text-gray-900"
      >
        <Menu class="h-6 w-6" />
      </button>

      <!-- Page Title -->
      <h1 class="hidden sm:block text-xl font-semibold text-gray-900">
        {{ pageTitle }}
      </h1>

      <!-- Right Actions -->
      <div class="flex items-center gap-3 ml-auto">
        <!-- Export Dropdown - Only show on Jobs page -->
        <ExportDropdown v-if="isJobsPage" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Menu } from 'lucide-vue-next'
import ExportDropdown from './ExportDropdown.vue'

defineEmits<{
  'toggle-sidebar': []
}>()

const route = useRoute()

// Get page title from route meta or fallback to manual mapping
const pageTitle = computed(() => {
  // First try route meta
  if (route.meta.pageTitle) {
    return route.meta.pageTitle as string
  }
  
  // Fallback to path-based mapping
  if (route.path === '/dashboard') return 'My Dashboard'
  if (route.path.includes('/jobs')) return 'My Applications'
  if (route.path.includes('/calendar')) return 'My Calendar'
  if (route.path.includes('/analytics')) return 'My Analytics'
  if (route.path.includes('/contacts')) return 'My Contacts'
  return 'ApplyLog'
})

// Only show export button on Jobs page
const isJobsPage = computed(() => {
  return route.path.includes('/jobs')
})
</script>