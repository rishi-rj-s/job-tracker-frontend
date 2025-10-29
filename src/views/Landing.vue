<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero min-h-screen flex items-center justify-center relative overflow-hidden bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700">
      <div class="absolute inset-0 opacity-20">
        <div class="absolute top-20 left-20 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div class="absolute top-40 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div class="absolute bottom-20 left-40 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div class="container mx-auto px-6 relative z-10">
        <div class="text-center text-white">
          <h1 class="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up">
            Track Your Job Hunt
            <span class="block text-transparent bg-clip-text bg-linear-to-r from-yellow-300 to-pink-300">Like a Pro</span>
          </h1>
          <p class="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
            Never lose track of your applications. Organize, monitor, and land your dream job with our intuitive job application tracker.
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up animation-delay-400">
            <button @click="$router.push('/signup')" 
                    class="px-8 py-4 bg-white text-indigo-600 rounded-full font-bold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all shadow-2xl">
              Get Started Free
            </button>
            <button @click="scrollToFeatures" 
                    class="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white hover:text-indigo-600 transform hover:scale-105 transition-all">
              Learn More
            </button>
          </div>

          <div class="flex items-center justify-center gap-8 text-sm text-blue-100 animate-fade-in-up animation-delay-600">
            <div class="flex items-center gap-2">
              <Check class="h-5 w-5 text-green-300" />
              <span>Free Forever</span>
            </div>
            <div class="flex items-center gap-2">
              <Check class="h-5 w-5 text-green-300" />
              <span>No Credit Card</span>
            </div>
            <div class="flex items-center gap-2">
              <Check class="h-5 w-5 text-green-300" />
              <span>Setup in 2 mins</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Rest of landing page... (features, stats, etc.) -->
  </div>
</template>

<script setup lang="ts">
import { Check } from 'lucide-vue-next'

const scrollToFeatures = () => {
  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
@keyframes blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.8s ease-out forwards;
}

.animation-delay-200 {
  animation-delay: 0.2s;
  opacity: 0;
}

.animation-delay-400 {
  animation-delay: 0.4s;
  opacity: 0;
}

.animation-delay-600 {
  animation-delay: 0.6s;
  opacity: 0;
}
</style>
