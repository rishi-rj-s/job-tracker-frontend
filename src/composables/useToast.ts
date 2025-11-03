import { ref } from 'vue'

export type ToastType = 'blue' | 'green' | 'red' | 'yellow' | 'orange' | 'gray'

interface Toast {
  id: string
  message: string
  type: ToastType
  show: boolean
}

// Global state - shared across all components
const toasts = ref<Toast[]>([])

export function useToast() {
  const showToast = (message: string, type: ToastType = 'blue', duration = 3000) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    
    const toast: Toast = {
      id,
      message,
      type,
      show: false
    }
    
    toasts.value.push(toast)
    
    // Trigger animation
    setTimeout(() => {
      const index = toasts.value.findIndex(t => t.id === id)
      if (index !== -1) {
        toasts.value[index]!.show = true
      }
    }, 10)
    
    // Auto remove
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }
  
  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value[index]!.show = false
      setTimeout(() => {
        toasts.value = toasts.value.filter(t => t.id !== id)
      }, 300)
    }
  }
  
  return {
    toasts,
    showToast,
    removeToast
  }
}