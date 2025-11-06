<template>
  <div class="landing-page">
    <Navbar />
    <HeroSection />
    <FeaturesSection />
    <HowItWorksSection />
    <CTASection />
    <FooterSection />
  </div>
</template>

<script setup lang="ts">
import { useSEO } from '@/composables/useSEO'
import Navbar from '@/components/landing/Navbar.vue'
import HeroSection from '@/components/landing/HeroSection.vue'
import FeaturesSection from '@/components/landing/FeaturesSection.vue'
import HowItWorksSection from '@/components/landing/HowItWorksSection.vue'
import CTASection from '@/components/landing/CTASection.vue'
import FooterSection from '@/components/landing/FooterSection.vue'

// Add SEO meta tags
useSEO({
  title: 'ApplyLog - Track Your Job Applications Like a Pro',
  description: 'Organize and track all your job applications in one place. Never miss a follow-up or lose track of an opportunity again. Free job application tracker.',
  keywords: 'job application tracker, job search organizer, application manager, career tools, job hunting, apply log',
  url: 'https://localhost:5713',
  type: 'website'
})
</script>

<style scoped>
.landing-page {
  background: #111827;
  padding-top: 70px; /* Height of navbar */
}

@media (max-width: 768px) {
  .landing-page {
    padding-top: 60px; /* Mobile navbar height */
  }
}
</style>