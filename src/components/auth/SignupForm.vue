<template>
  <form @submit.prevent="handleSubmit" class="mt-6 space-y-4">
    <AlertMessage v-if="errorMessage" :message="errorMessage" type="error" />
    <AlertMessage v-if="successMessage" :message="successMessage" type="success" />

    <div class="space-y-3">
      <AuthInput
        id="fullName"
        name="fullName"
        type="text"
        label="Full Name"
        v-model="fullName"
        required
      />

      <AuthInput
        id="email"
        name="email"
        type="email"
        label="Email address"
        v-model="email"
        required
      />

      <AuthInput
        id="password"
        name="password"
        type="password"
        label="Password"
        v-model="password"
        required
        :minlength="6"
        hint="Must be at least 6 characters"
      />

      <AuthInput
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        label="Confirm Password"
        v-model="confirmPassword"
        required
      />
    </div>

    <div>
      <button
        type="submit"
        :disabled="loading"
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <span v-if="loading">Creating account...</span>
        <span v-else>Create account</span>
      </button>
    </div>

    <div class="mt-4">
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-600"></div>
        </div>
        <div class="relative flex justify-center text-xs">
          <span class="px-2 bg-gray-800 text-gray-400">Or</span>
        </div>
      </div>

      <div class="mt-3">
        <GoogleButton
          text="Sign up with Google"
          :disabled="loading"
          @click="handleGoogleAuthWithToast"
        />
      </div>
    </div>

    <div class="text-center text-sm">
      <span class="text-gray-400">Already have an account? </span>
      <router-link to="/login" class="font-medium text-purple-400 hover:text-purple-300 transition-colors">
        Sign in
      </router-link>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthForm } from '@/composables/useAuthForm'
import { useToast } from '@/composables/useToast'
import AuthInput from './AuthInput.vue'
import AlertMessage from './AlertMessage.vue'
import GoogleButton from './GoogleButton.vue'

const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const { showToast } = useToast()

const { loading, errorMessage, successMessage, handleSignupSubmit, handleGoogleAuth } = useAuthForm()

const handleSubmit = async () => {
  const success = await handleSignupSubmit(email.value, password.value, confirmPassword.value, fullName.value)
  
  if (success) {
    if (successMessage.value.includes('verify')) {
      showToast('Account created! Please check your email to verify.', 'blue')
    } else {
      showToast('Account created successfully! Welcome aboard!', 'green')
    }
  } else {
    showToast(errorMessage.value || 'Sign up failed. Please try again.', 'red')
  }
}

const handleGoogleAuthWithToast = async () => {
  const success = await handleGoogleAuth()
  if (success) {
    showToast('Redirecting to Google...', 'blue')
  }
}
</script>