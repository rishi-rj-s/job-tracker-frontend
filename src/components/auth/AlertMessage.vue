<template>
  <div
    v-if="message"
    :class="[
      'px-4 py-3 rounded-lg text-sm',
      type === 'error' ? 'bg-red-900/50 border border-red-700 text-red-200' : 'bg-green-900/50 border border-green-700 text-green-200'
    ]"
  >
    {{ message }}
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: string
  type: 'error' | 'success'
}>()
</script>