<template>
  <div class="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-8">
    <div class="max-w-md w-full space-y-6 bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
      <!-- Back to Home Button -->
      <div class="flex items-center justify-between">
        <router-link 
          to="/" 
          class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          <span>Back to Home</span>
        </router-link>
        
        <!-- Logo/Brand -->
        <router-link to="/" class="flex items-center gap-2">
          <svg class="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
          </svg>
          <span class="text-lg font-bold text-white">ApplyLog</span>
        </router-link>
      </div>

      <div class="text-center">
        <h2 class="text-3xl font-bold text-white">{{ title }}</h2>
        <p class="mt-2 text-sm text-gray-400">{{ subtitle }}</p>
      </div>

      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
}>()
</script>