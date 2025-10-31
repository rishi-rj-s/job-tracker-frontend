<template>
  <section class="cta-section">
    <div class="container">
      <div class="content">
        <h2 class="title">Ready to Ditch the Spreadsheet?</h2>
        <p class="subtitle">
          Start logging your applications with our simple form. Completely free, no strings attached.
        </p>
        <button @click="$router.push('/signup')" class="cta-button">
          Start Logging for Free
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped>
.cta-section {
  min-height: 60vh;
  display: flex;
  align-items: center;
  padding: 80px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.content {
  text-align: center;
}

.title {
  font-size: 2.5rem;
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

.cta-button {
  padding: 16px 40px;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 8px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .cta-section {
    min-height: 50vh;
    padding: 60px 20px;
  }

  .title {
    font-size: 2rem;
  }

  .subtitle {
    font-size: 1.1rem;
  }

  .cta-button {
    width: 100%;
  }
}
</style>