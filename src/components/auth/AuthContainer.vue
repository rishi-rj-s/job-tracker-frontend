<template>
  <div
    class="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 px-4 py-8">
    <div class="max-w-md w-full space-y-6 bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
      <!-- Back to Home Button -->
      <div class="flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Home</span>
        </router-link>

        <!-- Logo/Brand -->
        <router-link to="/" class="flex logo items-center gap-2 transition-opacity hover:opacity-80 cursor-pointer">
          <img :src="logo" alt="ApplyLog Logo" class="logo-img" />
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
import logo from '@/assets/logo.svg'
defineProps<{
  title: string
  subtitle: string
}>()
</script>