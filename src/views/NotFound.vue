<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="text-center">
      <div class="mb-8">
        <div class="text-9xl font-bold text-indigo-600">404</div>
        <div class="mt-4">
          <FileQuestion class="h-24 w-24 text-gray-400 mx-auto" />
        </div>
      </div>
      
      <h1 class="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
      <p class="text-lg text-gray-600 mb-8 max-w-md mx-auto">
        Oops! The page you're looking for doesn't exist. 
        It might have been moved or deleted.
      </p>
      
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button @click="$router.back()" 
                class="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
          ← Go Back
        </button>
        <router-link to="/" 
                     class="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
          Go to Homepage
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileQuestion } from 'lucide-vue-next'
</script>