<template>
  <section class="min-h-screen pt-[120px] pb-20 px-8 relative overflow-hidden">
    <div class="max-w-7xl mx-auto relative z-10">
      <!-- Main Content -->
      <div class="text-center max-w-[800px] mx-auto mb-20">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-8 animate-fade-in-up">
          <span class="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
          <span class="text-sm text-white/90 font-medium tracking-tight">Your Job Search Command Center</span>
        </div>
        
        <h1 class="text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight animate-fade-in-up animation-delay-100">
          Track Every Application.<br />
          <span class="bg-linear-to-r from-indigo-500 via-purple-600 to-pink-500 bg-clip-text text-transparent">Never Miss a Follow-up.</span>
        </h1>
        
        <p class="text-xl text-white/60 leading-relaxed mb-10 max-w-[650px] mx-auto animate-fade-in-up animation-delay-200">
          Log job applications, manage follow-up dates, store HR contacts, and track your progress—all in one beautiful interface. Built for serious job seekers.
        </p>

        <div class="flex flex-col items-center gap-4 animate-fade-in-up animation-delay-300">
          <button 
            @click="$router.push('/signup')" 
            class="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-[17px] font-semibold tracking-tight shadow-[0_8px_32px_rgba(99,102,241,0.4)] transition-all hover:shadow-[0_12px_40px_rgba(99,102,241,0.5)] hover:-translate-y-0.5 group"
          >
            Start Tracking Free
            <ArrowRight class="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
          <div class="flex items-center gap-1.5 text-white/50 text-sm">
            <Check class="w-4 h-4 text-emerald-500" />
            <span>No credit card required</span>
          </div>
        </div>
      </div>

      <!-- Feature Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
        <div 
          v-for="(feature, index) in features" 
          :key="index"
          class="bg-white/2 border border-white/6 rounded-2xl p-8 transition-all duration-300 hover:bg-white/4 hover:border-indigo-500/30 hover:-translate-y-1 animate-fade-in-up"
          :style="{ animationDelay: `${0.4 + index * 0.1}s` }"
        >
          <div class="w-12 h-12 bg-linear-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-center mb-5">
            <component :is="feature.icon" class="w-6 h-6 text-purple-600" />
          </div>
          <h3 class="text-lg font-semibold text-white mb-3 tracking-tight">{{ feature.title }}</h3>
          <p class="text-[15px] text-white/50 leading-relaxed">{{ feature.description }}</p>
        </div>
      </div>

      <!-- Bottom Section -->
      <div class="text-center animate-fade-in-up animation-delay-700">
        <div class="flex justify-center gap-16 p-8 bg-white/2 border border-white/6 rounded-2xl max-w-[600px] mx-auto">
          <div 
            v-for="(stat, index) in stats" 
            :key="index"
            class="text-center"
          >
            <div class="text-3xl font-bold text-white mb-2 tracking-tight">{{ stat.value }}</div>
            <div class="text-sm text-white/50 uppercase tracking-wider">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Decorative Elements -->
    <div class="absolute w-[600px] h-[600px] rounded-full blur-[80px] opacity-40 pointer-events-none top-[-200px] left-[-200px] bg-[radial-gradient(circle,rgba(99,102,241,0.4)_0%,transparent_70%)]"></div>
    <div class="absolute w-[500px] h-[500px] rounded-full blur-[80px] opacity-40 pointer-events-none bottom-[-100px] right-[-100px] bg-[radial-gradient(circle,rgba(139,92,246,0.3)_0%,transparent_70%)]"></div>
  </section>
</template>

<script setup lang="ts">
import { ArrowRight, Check, Calendar, Users, TrendingUp, FileText } from 'lucide-vue-next'

const features = [
  {
    icon: FileText,
    title: 'Application Logging',
    description: 'Quick form to capture company, role, salary, platform, and status for every application you send.'
  },
  {
    icon: Calendar,
    title: 'Follow-up Calendar',
    description: 'Mark next follow-up dates and see them all in one calendar view. Never forget to check back.'
  },
  {
    icon: Users,
    title: 'HR Contacts',
    description: 'Store recruiter names, companies, and phone numbers. Tap to dial directly from your phone.'
  },
  {
    icon: TrendingUp,
    title: 'Analytics',
    description: 'Visualize your job search progress, success rates, and trends to optimize your strategy.'
  }
]

const stats = [
  { value: 'Free', label: 'Forever' },
  { value: '100%', label: 'Private' },
  { value: 'Unlimited', label: 'Applications' }
]
</script>

<style scoped>
@keyframes fadeInUp {
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
  animation: fadeInUp 0.6s ease-out both;
}

.animation-delay-100 {
  animation-delay: 0.1s;
}

.animation-delay-200 {
  animation-delay: 0.2s;
}

.animation-delay-300 {
  animation-delay: 0.3s;
}

.animation-delay-700 {
  animation-delay: 0.7s;
}

@media (max-width: 1024px) {
  h1 {
    font-size: 3rem;
  }
}

@media (max-width: 768px) {
  section {
    padding-top: 100px;
    padding-bottom: 60px;
    padding-left: 20px;
    padding-right: 20px;
  }

  h1 {
    font-size: 2.25rem;
  }

  p {
    font-size: 1.0625rem;
  }

  button {
    width: 100%;
    justify-content: center;
  }

  .grid {
    grid-template-columns: 1fr;
  }

  .flex.gap-16 {
    flex-direction: column;
    gap: 2rem;
  }
}
</style>