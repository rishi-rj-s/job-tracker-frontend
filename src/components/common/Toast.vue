<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-9999 flex flex-col gap-3 max-w-md pointer-events-none sm:max-w-sm">
      <TransitionGroup name="toast">
        <div 
          v-for="toast in toasts" 
          :key="toast.id"
          :class="[
            'w-full p-4 rounded-lg shadow-2xl flex items-start gap-3',
            'pointer-events-auto backdrop-blur-sm',
            'border transform transition-all duration-300',
            getToastClasses(toast.type)
          ]"
        >
          <component 
            :is="getIcon(toast.type)" 
            class="w-5 h-5 shrink-0 mt-0.5" 
          />
          <div class="flex-1 text-sm leading-relaxed font-medium">
            {{ toast.message }}
          </div>
          <button
            @click="removeToast(toast.id)"
            class="shrink-0 opacity-70 hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/20"
            aria-label="Close notification"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { AlertCircle, CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-vue-next'
import { useToast, type ToastType } from '@/composables/useToast'

const { toasts, removeToast } = useToast()

const getIcon = (type: ToastType) => {
  const icons: Record<ToastType, any> = {
    blue: Info,
    green: CheckCircle,
    red: XCircle,
    yellow: AlertTriangle,
    orange: AlertTriangle,
    gray: AlertCircle
  }
  return icons[type]
}

const getToastClasses = (type: ToastType) => {
  const classes: Record<ToastType, string> = {
    blue: 'bg-blue-500 text-white border-blue-600',
    green: 'bg-green-500 text-white border-green-600',
    red: 'bg-red-500 text-white border-red-600',
    yellow: 'bg-yellow-500 text-white border-yellow-600',
    orange: 'bg-orange-500 text-white border-orange-600',
    gray: 'bg-gray-500 text-white border-gray-600'
  }
  return classes[type]
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>