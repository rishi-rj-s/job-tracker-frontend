<template>
  <div>
    <label :for="id" class="block text-sm font-medium text-gray-300">
      {{ label }}
      <span v-if="required" class="text-red-400">*</span>
    </label>
    <input
      :id="id"
      :name="name"
      :type="type"
      :required="required"
      :minlength="minlength"
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      class="mt-1 block w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-lg shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
    />
    <p v-if="hint" class="mt-1 text-xs text-gray-400">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  id: string
  name: string
  type: string
  label: string
  modelValue: string
  required?: boolean
  minlength?: number
  placeholder?: string
  hint?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>