<template>
  <div class="fixed top-5 right-5 z-9999 flex flex-col gap-3 pointer-events-none max-sm:left-2.5 max-sm:right-2.5 max-sm:top-2.5">
    <div v-for="toast in toasts" :key="toast.id"
         :class="['min-w-[300px] max-w-[500px] max-sm:min-w-0 max-sm:w-full p-4 rounded-xl shadow-2xl flex items-center gap-3 opacity-0 translate-x-[400px] transition-all duration-300 pointer-events-auto backdrop-blur-[10px] font-medium',
                  `toast-${toast.type}`,
                  { 'opacity-100 translate-x-0': toast.show, 'opacity-0 translate-x-[400px]': !toast.show }]">
      <component :is="getIcon(toast.type)" class="w-6 h-6 shrink-0" />
      <div class="flex-1 text-sm leading-6">{{ toast.message }}</div>
      <X @click="removeToast(toast.id)" class="w-5 h-5 shrink-0 opacity-70 hover:opacity-100 cursor-pointer transition-opacity" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-vue-next'
import { useToast, type ToastType } from '@composables/useToast'

const { toasts, removeToast } = useToast()

const getIcon = (type: ToastType) => {
  const icons = {
    blue: Info,
    green: CheckCircle,
    red: XCircle,
    yellow: AlertTriangle,
    orange: AlertTriangle,
    gray: AlertCircle
  }
  return icons[type] || icons.blue
}
</script>

<style scoped>
.toast-blue { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; }
.toast-green { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
.toast-red { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; }
.toast-yellow { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; }
.toast-orange { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; }
.toast-gray { background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); color: white; }
</style>