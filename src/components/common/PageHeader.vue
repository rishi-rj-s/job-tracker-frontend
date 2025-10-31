<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900">{{ title }}</h1>
    <p class="text-gray-600 mt-1">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>