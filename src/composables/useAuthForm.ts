import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

export function useAuthForm() {
  const authStore = useAuthStore()
  const router = useRouter()

  const loading = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')

  const clearMessages = () => {
    errorMessage.value = ''
    successMessage.value = ''
  }

  const handleLoginSubmit = async (email: string, password: string) => {
    if (!email || !password) {
      errorMessage.value = 'Please fill in all fields'
      return false
    }

    loading.value = true
    clearMessages()

    const result = await authStore.signIn(email, password)

    if (result.success) {
      router.push('/dashboard')
      return true
    } else {
      errorMessage.value = result.message || 'Failed to sign in'
      loading.value = false
      return false
    }
  }

  const handleSignupSubmit = async (
    email: string, 
    password: string, 
    confirmPassword: string, 
    fullName: string
  ) => {
    clearMessages()

    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      errorMessage.value = 'Please fill in all fields'
      return false
    }

    if (password !== confirmPassword) {
      errorMessage.value = 'Passwords do not match'
      return false
    }

    if (password.length < 6) {
      errorMessage.value = 'Password must be at least 6 characters'
      return false
    }

    loading.value = true

    const result = await authStore.signUp(email, password, fullName)

    if (result.success) {
      successMessage.value = result.message
      
      // If auto-login is enabled (email confirmation disabled), redirect immediately
      if (result.autoLogin && authStore.isAuthenticated) {
        router.push('/dashboard')
      } 
      // If email verification is required, show message
      else if (result.requiresVerification) {
        loading.value = false
      }
      
      return true
    } else {
      errorMessage.value = result.message || 'Failed to create account'
      loading.value = false
      return false
    }
  }

  const handleGoogleAuth = async () => {
    loading.value = true
    clearMessages()

    const result = await authStore.signInWithGoogle()

    if (!result.success && result.message) {
      errorMessage.value = result.message
      loading.value = false
      return false
    }
    return true
  }

  return {
    loading,
    errorMessage,
    successMessage,
    clearMessages,
    handleLoginSubmit,
    handleSignupSubmit,
    handleGoogleAuth
  }
}