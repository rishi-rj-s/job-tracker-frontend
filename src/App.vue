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
  } catch (error) {
  } finally {
    authLoading.value = false
  }
})
</script>

<style>
.logo-img {
  width: 50px;
  height: 50px;
  object-fit: contain;
  display: block;
  transition: transform 0.2s ease;
  filter: drop-shadow(0 0 2px rgba(167, 139, 250, 0.4));
}

.logo:hover .logo-img {
  transform: scale(1.25);
}
</style>