<template>
  <AuthContainer
    title="Create Account"
    subtitle="Start logging your job applications"
  >
    <SignupForm />
  </AuthContainer>
</template>

<script setup lang="ts">
import AuthContainer from '@/components/auth/AuthContainer.vue'
import SignupForm from '@/components/auth/SignupForm.vue'
</script>