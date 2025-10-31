<template>
  <section class="how-it-works">
    <div class="container">
      <div class="header">
        <h2 class="title">How It Works</h2>
        <p class="subtitle">Get started in minutes</p>
      </div>

      <div class="steps-grid">
        <div v-for="(step, index) in steps" :key="index" class="step-card">
          <div class="step-number">{{ index + 1 }}</div>
          <h3 class="step-title">{{ step.title }}</h3>
          <p class="step-description">{{ step.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const steps = [
  {
    title: 'Sign Up Free',
    description: 'Create your free account in seconds. No credit card needed.'
  },
  {
    title: 'Fill Out the Form',
    description: 'Each time you apply to a job, log it with our quick form.'
  },
  {
    title: 'View Your Log',
    description: 'See all your applications in one place, organized and searchable.'
  }
]
</script>

<style scoped>
.how-it-works {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 80px 20px;
  background: #111827;
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

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 40px;
}

.step-card {
  text-align: center;
}

.step-number {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 auto 24px;
}

.step-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 12px;
}

.step-description {
  font-size: 1rem;
  color: #d1d5db;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .how-it-works {
    padding: 60px 20px;
  }

  .title {
    font-size: 2rem;
  }

  .steps-grid {
    grid-template-columns: 1fr;
  }
}
</style>