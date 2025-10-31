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
        <!-- Export Dropdown -->
        <ExportDropdown />
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

const pageTitle = computed(() => {
  if (route.path === '/dashboard') return 'Dashboard'
  if (route.path.includes('/jobs')) return 'My Applications'
  return 'JobTracker'
})
</script>