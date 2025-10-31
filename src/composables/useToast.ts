import { ref } from 'vue'

export type ToastType = 'blue' | 'green' | 'red' | 'yellow' | 'orange' | 'gray'

interface Toast {
  id: number
  message: string
  type: ToastType
  show: boolean
}

const toasts = ref<Toast[]>([])
let toastId = 0

export const useToast = () => {
  const showToast = (message: string, type: ToastType = 'blue', duration = 3000) => {
    const id = toastId++
    const toast: Toast = { id, message, type, show: false }

    toasts.value.push(toast)

    setTimeout(() => {
      toast.show = true
    }, 10)

    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  const removeToast = (id: number) => {
    const toast = toasts.value.find(t => t.id === id)
    if (toast) {
      toast.show = false
      setTimeout(() => {
        toasts.value = toasts.value.filter(t => t.id !== id)
      }, 400)
    }
  }

  return { toasts, showToast, removeToast }
}