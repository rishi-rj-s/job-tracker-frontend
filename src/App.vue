<template>
  <div id="app">
    <router-view v-if="!authLoading" />
    <div v-else class="min-h-screen flex items-center justify-center bg-gray-900">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
        <p class="text-gray-400">Loading...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
const authLoading = ref(true)

onMounted(async () => {
  try {
    await authStore.initialize()
    console.log('✅ Auth initialized:', authStore.isAuthenticated ? 'Logged in' : 'Guest')
  } catch (error) {
    console.error('❌ Auth initialization failed:', error)
  } finally {
    authLoading.value = false
  }
})
</script>

<style>
/* Global styles if needed */
</style>