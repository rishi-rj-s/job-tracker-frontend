<template>
  <AuthContainer
    title="Welcome Back"
    subtitle="Sign in to log your job applications"
  >
    <LoginForm />
  </AuthContainer>
</template>

<script setup lang="ts">
import { useSEO } from '@/composables/useSEO'
import AuthContainer from '@/components/auth/AuthContainer.vue'
import LoginForm from '@/components/auth/LoginForm.vue'

// Add SEO meta tags
useSEO({
  title: 'Login',
  description: 'Sign in to your ApplyLog account to track and manage your job applications.',
  url: 'https://localhost:5713/login'
})
</script>