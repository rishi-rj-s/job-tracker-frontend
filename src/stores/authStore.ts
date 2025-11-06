import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)

  // Initialize auth state
  async function initialize() {
    try {
      loading.value = true
      const { data: { session } } = await supabase.auth.getSession()
      user.value = session?.user || null

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        user.value = session?.user || null
      })
    } catch (err: any) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Sign up with email and password
  async function signUp(email: string, password: string, fullName?: string) {
    try {
      error.value = null
      loading.value = true

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (signUpError) throw signUpError

      // Check if email confirmation is disabled (auto-login enabled)
      if (data.user && data.session) {
        user.value = data.user
        return { success: true, message: 'Account created successfully!', autoLogin: true }
      }

      // Email confirmation required
      if (data.user && !data.session) {
        return { 
          success: true, 
          message: 'Please check your email to verify your account.', 
          requiresVerification: true 
        }
      }

      return { success: true, message: 'Account created! Please check your email.' }
    } catch (err: any) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  // Sign in with email and password
  async function signIn(email: string, password: string) {
    try {
      error.value = null
      loading.value = true

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) throw signInError

      user.value = data.user
      return { success: true, message: 'Signed in successfully!' }
    } catch (err: any) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  // Sign in with Google
  async function signInWithGoogle() {
    try {
      error.value = null
      loading.value = true

      const { data, error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (signInError) throw signInError

      return { success: true }
    } catch (err: any) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  // Sign out
  async function signOut() {
    try {
      error.value = null
      loading.value = true

      const { error: signOutError } = await supabase.auth.signOut()
      
      if (signOutError) throw signOutError

      user.value = null
      return { success: true, message: 'Signed out successfully!' }
    } catch (err: any) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  // Reset password
  async function resetPassword(email: string) {
    try {
      error.value = null
      loading.value = true

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (resetError) throw resetError

      return { success: true, message: 'Password reset email sent!' }
    } catch (err: any) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      loading.value = false
    }
  }

  // Get auth token for API calls
  async function getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    initialize,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    getAuthToken
  }
})