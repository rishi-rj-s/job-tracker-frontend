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
import Navbar from '@/components/landing/Navbar.vue'
import HeroSection from '@/components/landing/HeroSection.vue'
import FeaturesSection from '@/components/landing/FeaturesSection.vue'
import HowItWorksSection from '@/components/landing/HowItWorksSection.vue'
import CTASection from '@/components/landing/CTASection.vue'
import FooterSection from '@/components/landing/FooterSection.vue'
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