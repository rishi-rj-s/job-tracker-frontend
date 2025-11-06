<template>
  <div class="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
    <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-100 mb-6">
      <component :is="iconComponent" class="h-10 w-10 text-indigo-600" />
    </div>
    <h2 class="text-2xl font-bold text-gray-900 mb-3">{{ title }}</h2>
    <p class="text-gray-600 max-w-md mx-auto mb-6">
      {{ description }}
    </p>
    <div class="flex justify-center gap-3">
      <router-link 
        to="/dashboard/jobs"
        class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
      >
        Back to Applications
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Calendar, BarChart3, Users } from 'lucide-vue-next'

const props = defineProps<{
  icon: 'calendar' | 'bar-chart' | 'users'
  title: string
  description: string
}>()

const iconComponent = computed(() => {
  const icons = {
    'calendar': Calendar,
    'bar-chart': BarChart3,
    'users': Users
  }
  return icons[props.icon]
})
</script>