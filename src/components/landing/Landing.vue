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

    <!-- Features Section -->
    <section id="features" class="py-20 bg-white">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need to Land Your Dream Job
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to simplify your job search and maximize your success
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div v-for="(feature, index) in features" :key="index"
               class="group p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-linear-tobr from-gray-50 to-white border border-gray-100">
            <div class="w-16 h-16 bg-linear-tobr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <component :is="feature.icon" class="h-8 w-8 text-white" />
            </div>
            <h3 class="text-2xl font-bold mb-4 text-gray-900">{{ feature.title }}</h3>
            <p class="text-gray-600 leading-relaxed">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="py-20 bg-linear-tor from-indigo-600 to-purple-600 text-white">
      <div class="container mx-auto px-6">
        <div class="grid md:grid-cols-4 gap-8 text-center">
          <div v-for="(stat, index) in stats" :key="index" class="animate-fade-in-up">
            <div class="text-5xl font-bold mb-2">{{ stat.value }}</div>
            <div class="text-xl text-indigo-200">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="py-20 bg-gray-50">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Start Tracking in 3 Simple Steps
          </h2>
        </div>

        <div class="grid md:grid-cols-3 gap-12">
          <div v-for="(step, index) in steps" :key="index" class="text-center">
            <div class="w-20 h-20 bg-indigo-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 shadow-lg">
              {{ index + 1 }}
            </div>
            <h3 class="text-2xl font-bold mb-4 text-gray-900">{{ step.title }}</h3>
            <p class="text-gray-600 text-lg">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits Section -->
    <section class="py-20 bg-white">
      <div class="container mx-auto px-6">
        <div class="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Stay Organized, Stay Ahead
            </h2>
            <div class="space-y-6">
              <div v-for="(benefit, index) in benefits" :key="index" class="flex gap-4">
                <div class="shrink-0">
                  <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Check class="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div>
                  <h3 class="text-xl font-bold mb-2 text-gray-900">{{ benefit.title }}</h3>
                  <p class="text-gray-600">{{ benefit.description }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="relative">
            <div class="bg-linear-tobr from-indigo-100 to-purple-100 rounded-3xl p-8 shadow-2xl">
              <div class="space-y-4">
                <div class="bg-white p-4 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
                  <div class="flex items-center gap-3 mb-2">
                    <Briefcase class="h-5 w-5 text-indigo-600" />
                    <span class="font-semibold">Software Engineer</span>
                  </div>
                  <div class="text-sm text-gray-600">Applied 2 days ago</div>
                </div>
                <div class="bg-white p-4 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
                  <div class="flex items-center gap-3 mb-2">
                    <Briefcase class="h-5 w-5 text-green-600" />
                    <span class="font-semibold">Product Manager</span>
                  </div>
                  <div class="text-sm text-gray-600">Interview scheduled</div>
                </div>
                <div class="bg-white p-4 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
                  <div class="flex items-center gap-3 mb-2">
                    <Briefcase class="h-5 w-5 text-purple-600" />
                    <span class="font-semibold">UX Designer</span>
                  </div>
                  <div class="text-sm text-gray-600">Screening stage</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-linear-tobr from-indigo-600 via-purple-600 to-pink-600 text-white">
      <div class="container mx-auto px-6 text-center">
        <h2 class="text-4xl md:text-6xl font-bold mb-6">
          Ready to Supercharge Your Job Search?
        </h2>
        <p class="text-xl md:text-2xl mb-12 text-indigo-100 max-w-2xl mx-auto">
          Join thousands of job seekers who landed their dream jobs using our tracker
        </p>
        <button @click="$router.push('/signup')"
                class="px-12 py-5 bg-white text-indigo-600 rounded-full font-bold text-xl hover:bg-gray-100 transform hover:scale-110 transition-all shadow-2xl">
          Start Tracking for Free
        </button>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12">
      <div class="container mx-auto px-6">
        <div class="grid md:grid-cols-4 gap-8">
          <div>
            <h3 class="text-2xl font-bold mb-4">JobTracker</h3>
            <p class="text-gray-400">Your ultimate job application companion</p>
          </div>
          <div>
            <h4 class="font-bold mb-4">Product</h4>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#features" class="hover:text-white transition">Features</a></li>
              <li><a href="#" class="hover:text-white transition">Pricing</a></li>
              <li><a href="#" class="hover:text-white transition">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-bold mb-4">Company</h4>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white transition">About</a></li>
              <li><a href="#" class="hover:text-white transition">Blog</a></li>
              <li><a href="#" class="hover:text-white transition">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-bold mb-4">Legal</h4>
            <ul class="space-y-2 text-gray-400">
              <li><a href="#" class="hover:text-white transition">Privacy</a></li>
              <li><a href="#" class="hover:text-white transition">Terms</a></li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 JobTracker. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { Briefcase, Target, BarChart3, FileText, Download, Bell, Check } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useHead } from '@vueuse/head'

const router = useRouter()

// SEO Meta Tags
useHead({
  title: 'JobTracker - Track Your Job Applications Like a Pro',
  meta: [
    {
      name: 'description',
      content: 'Never lose track of your job applications. Organize, monitor, and land your dream job with our intuitive job application tracker. Free forever, no credit card required.'
    },
    {
      name: 'keywords',
      content: 'job tracker, job application tracker, job search organizer, career tracker, job hunt, application management, job search tool'
    },
    {
      property: 'og:title',
      content: 'JobTracker - Track Your Job Applications Like a Pro'
    },
    {
      property: 'og:description',
      content: 'Never lose track of your job applications. Organize, monitor, and land your dream job with our intuitive job application tracker.'
    },
    {
      property: 'og:type',
      content: 'website'
    },
    {
      property: 'og:image',
      content: '/og-image.png'
    },
    {
      name: 'twitter:card',
      content: 'summary_large_image'
    },
    {
      name: 'twitter:title',
      content: 'JobTracker - Track Your Job Applications Like a Pro'
    },
    {
      name: 'twitter:description',
      content: 'Never lose track of your job applications. Organize, monitor, and land your dream job.'
    }
  ],
  link: [
    {
      rel: 'canonical',
      href: 'https://yourapp.com'
    }
  ]
})

const features = [
  {
    icon: Target,
    title: 'Smart Organization',
    description: 'Keep all your applications in one place with custom statuses, tags, and notes. Never lose track of where you applied.'
  },
  {
    icon: BarChart3,
    title: 'Visual Analytics',
    description: 'Track your progress with beautiful charts and insights. Know exactly where you stand in your job search journey.'
  },
  {
    icon: Bell,
    title: 'Smart Reminders',
    description: 'Never miss a follow-up or interview. Get timely notifications for important dates and next actions.'
  },
  {
    icon: FileText,
    title: 'Application Details',
    description: 'Store job descriptions, requirements, salary info, and important notes all in one organized place.'
  },
  {
    icon: Download,
    title: 'Export & Backup',
    description: 'Download your data anytime in CSV or JSON format. Your data, your control, always accessible.'
  },
  {
    icon: Briefcase,
    title: 'Multi-Platform',
    description: 'Track applications from LinkedIn, company websites, emails, and more. All platforms in one dashboard.'
  }
]

const stats = [
  { value: '10K+', label: 'Active Users' },
  { value: '50K+', label: 'Jobs Tracked' },
  { value: '95%', label: 'Success Rate' },
  { value: '4.9★', label: 'User Rating' }
]

const steps = [
  {
    title: 'Sign Up Free',
    description: 'Create your account in seconds. No credit card required, completely free forever.'
  },
  {
    title: 'Add Applications',
    description: 'Start adding your job applications with all the important details in one place.'
  },
  {
    title: 'Track & Land Jobs',
    description: 'Monitor your progress, get reminders, and land your dream job faster than ever.'
  }
]

const benefits = [
  {
    title: 'Stay on Top of Deadlines',
    description: 'Never miss an important follow-up or interview with smart date tracking and reminders.'
  },
  {
    title: 'Organize Multiple Applications',
    description: 'Keep track of dozens of applications without the chaos. Everything organized in one place.'
  },
  {
    title: 'Make Better Decisions',
    description: 'See patterns in your job search and optimize your strategy for better results.'
  },
  {
    title: 'Reduce Job Search Stress',
    description: 'Stop worrying about losing track of applications. Focus on preparing for interviews instead.'
  }
]

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

.animation-delay-800 {
  animation-delay: 0.8s;
  opacity: 0;
}
</style>