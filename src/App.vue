<template>
  <div id="app">
    <router-view v-if="!authStore.loading" />
    
    <!-- Loading Screen -->
    <div v-else class="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
        <p class="text-gray-600">Initializing your workspace</p>
      </div>
    </div>

    <!-- Global Toast -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/authStore'
import { useHead } from '@vueuse/head'
import Toast from './components/Toast.vue'

const authStore = useAuthStore()

// Global SEO defaults
useHead({
  titleTemplate: '%s | JobTracker',
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
    { name: 'theme-color', content: '#4F46E5' }
  ]
})

onMounted(async () => {
  await authStore.initialize()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  width: 100%;
  min-height: 100vh;
}
</style>
