<template>
  <AuthContainer
    title="Welcome Back"
    subtitle="Sign in to log your job applications"
  >
    <LoginForm />
  </AuthContainer>
</template>

<script setup lang="ts">
import AuthContainer from '@/components/auth/AuthContainer.vue'
import LoginForm from '@/components/auth/LoginForm.vue'
</script>