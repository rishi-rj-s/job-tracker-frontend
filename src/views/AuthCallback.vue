<template>
  <div class="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
    <div class="text-center">
      <div class="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Completing Sign In...</h2>
      <p class="text-gray-600">Please wait while we redirect you</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
  } else {
    router.push({
      name: 'login',
      query: { error: 'Authentication failed' }
    })
  }
})
</script>