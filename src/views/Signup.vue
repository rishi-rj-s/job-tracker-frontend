<template>
  <AuthContainer
    title="Create Account"
    subtitle="Start logging your job applications"
  >
    <SignupForm />
  </AuthContainer>
</template>

<script setup lang="ts">
import { useSEO } from '@/composables/useSEO'
import AuthContainer from '@/components/auth/AuthContainer.vue'
import SignupForm from '@/components/auth/SignupForm.vue'

// Add SEO meta tags
useSEO({
  title: 'Sign Up',
  description: 'Create your free ApplyLog account and start organizing your job applications today. No credit card required.',
  url: 'https://localhost:5713/signup'
})
</script>