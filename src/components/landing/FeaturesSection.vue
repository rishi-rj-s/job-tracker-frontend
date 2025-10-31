<template>
  <section class="features-section features">
    <div class="container">
      <div class="header">
        <h2 class="title">Everything You Need</h2>
        <p class="subtitle">Simple tools to help you stay organized</p>
      </div>

      <div class="features-grid">
        <div v-for="(feature, index) in features" :key="index" class="feature-card">
          <component :is="feature.icon" class="feature-icon" />
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Briefcase, FileText, Download, Bell } from 'lucide-vue-next'

const features = [
  {
    icon: Briefcase,
    title: 'Quick Form Entry',
    description: 'Fill out one simple form for each application. Much faster than Excel or Google Sheets.'
  },
  {
    icon: Bell,
    title: 'Date Reminders',
    description: 'Set follow-up dates and never forget to check back on your applications.'
  },
  {
    icon: FileText,
    title: 'Store Everything',
    description: 'Save job links, salary info, notes, and platform details all in one place.'
  },
  {
    icon: Download,
    title: 'Export Anytime',
    description: 'Download all your logged applications as CSV or JSON whenever you need.'
  }
]
</script>

<style scoped>
.features-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 80px 20px;
  background: #1f2937;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.header {
  text-align: center;
  margin-bottom: 60px;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 12px;
}

.subtitle {
  font-size: 1.125rem;
  color: #9ca3af;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
}

.feature-card {
  background: #374151;
  padding: 32px;
  border-radius: 12px;
  border: 1px solid #4b5563;
  transition: box-shadow 0.3s, transform 0.3s;
}

.feature-card:hover {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  transform: translateY(-4px);
  border-color: #667eea;
}

.feature-icon {
  width: 40px;
  height: 40px;
  color: #a78bfa;
  margin-bottom: 20px;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 12px;
}

.feature-description {
  font-size: 0.95rem;
  color: #d1d5db;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .features-section {
    padding: 60px 20px;
  }

  .title {
    font-size: 2rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>