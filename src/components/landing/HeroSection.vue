<template>
  <section class="hero">
    <div class="container">
      <div class="content">
        <h1 class="title">
          Log Your Job Applications
        </h1>
        <p class="subtitle">
          Stop using spreadsheets. Record every application you send in one simple form. Free forever.
        </p>
        
        <div class="actions">
          <button @click="$router.push('/signup')" class="btn-primary">
            Get Started
          </button>
          <button @click="scrollToFeatures" class="btn-secondary">
            See How It Works
          </button>
        </div>

        <div class="features-list">
          <div class="feature-item">
            <Check class="icon" />
            <span>Always Free</span>
          </div>
          <div class="feature-item">
            <Check class="icon" />
            <span>No Sign Up Required</span>
          </div>
          <div class="feature-item">
            <Check class="icon" />
            <span>Your Data, Your Control</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Check } from 'lucide-vue-next'

const scrollToFeatures = () => {
  const element = document.querySelector('.features-section')
  element?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
.hero {
  min-height: calc(100vh - 70px); /* Full viewport minus navbar */
  display: flex;
  align-items: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.content {
  text-align: center;
  max-width: 700px;
  margin: 0 auto;
}

.title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 20px;
  line-height: 1.2;
}

.subtitle {
  font-size: 1.25rem;
  margin-bottom: 40px;
  opacity: 0.95;
  line-height: 1.6;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.btn-primary {
  padding: 14px 32px;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-secondary {
  padding: 14px 32px;
  background: transparent;
  color: white;
  border: 2px solid white;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.btn-secondary:hover {
  background: white;
  color: #667eea;
}

.features-list {
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
}

.icon {
  width: 20px;
  height: 20px;
  color: #a3f3c4;
}

@media (max-width: 768px) {
  .hero {
    min-height: calc(100vh - 60px); /* Account for smaller mobile navbar */
    padding: 40px 20px;
  }

  .title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1.1rem;
  }

  .actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }

  .features-list {
    flex-direction: column;
    align-items: center;
  }
}
</style>