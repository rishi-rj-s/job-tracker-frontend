<template>
  <div class="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
    <Navbar />
    <main class="relative z-10">
      <HeroSection />
      <div class="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.15)_0%,transparent_50%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.15)_0%,transparent_50%)]"></div>
    </main>
    <FooterSection />
  </div>
</template>

<script setup lang="ts">
import { useSEO } from '@/composables/useSEO'
import Navbar from '@/components/landing/Navbar.vue'
import HeroSection from '@/components/landing/HeroSection.vue'
import FooterSection from '@/components/landing/FooterSection.vue'

useSEO({
  title: 'ApplyLog - Track Your Job Applications',
  description: 'Keep track of every job application, follow-up date, and HR contact in one beautiful interface.',
  keywords: 'job application tracker, job search organizer, application manager, career tools',
  url: 'https://www.apply-log.site/',
  type: 'website'
})
</script>