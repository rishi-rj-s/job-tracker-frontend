<template>
  <form @submit.prevent="handleSubmit" class="mt-8 space-y-6">
    <AlertMessage v-if="errorMessage" :message="errorMessage" type="error" />

    <div class="space-y-4">
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
      />
    </div>

    <div>
      <button
        type="submit"
        :disabled="loading"
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <span v-if="loading">Signing in...</span>
        <span v-else>Sign in</span>
      </button>
    </div>

    <div class="mt-6">
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-600"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-gray-800 text-gray-400">Or continue with</span>
        </div>
      </div>

      <div class="mt-6">
        <GoogleButton
          text="Sign in with Google"
          :disabled="loading"
          @click="handleGoogleAuth"
        />
      </div>
    </div>

    <div class="text-center text-sm">
      <span class="text-gray-400">Don't have an account? </span>
      <router-link to="/signup" class="font-medium text-purple-400 hover:text-purple-300 transition-colors">
        Sign up
      </router-link>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthForm } from '@/composables/useAuthForm'
import AuthInput from './AuthInput.vue'
import AlertMessage from './AlertMessage.vue'
import GoogleButton from './GoogleButton.vue'

const email = ref('')
const password = ref('')

const { loading, errorMessage, handleLoginSubmit, handleGoogleAuth } = useAuthForm()

const handleSubmit = async () => {
  await handleLoginSubmit(email.value, password.value)
}
</script>