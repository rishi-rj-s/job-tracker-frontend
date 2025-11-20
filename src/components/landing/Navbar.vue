<template>
  <nav class="fixed top-0 left-0 right-0 z-1000 transition-all duration-300 ease-in-out border-b" :class="[
    isScrolled
      ? 'bg-[rgba(10,10,10,0.95)] border-white/8 backdrop-blur-xl'
      : 'bg-[rgba(10,10,10,0.8)] border-white/6 backdrop-blur-xl'
  ]">
    <div class="max-w-7xl mx-auto px-8">
      <div class="flex items-center justify-between h-[72px]">
        <!-- Logo -->
        <div class="flex items-center gap-3 cursor-pointer transition-opacity hover:opacity-80"
          @click="$router.push('/')">
          <div
            class="w-8 h-8 bg-linear-to-br from-indigo-500 to-purple-600 rounded-lg relative overflow-hidden flex items-center justify-center">
            <img src="@/assets/logo.svg" alt="ApplyLog" class="w-20 h-20 relative z-10" />
            <div class="absolute inset-0 bg-linear-to-br from-transparent to-white/20"></div>
          </div>
          <span class="text-lg font-semibold text-white tracking-tight">ApplyLog</span>
        </div>

        <!-- Desktop Actions -->
        <div class="hidden md:flex items-center gap-3">
          <template v-if="isAuthenticated">
            <button @click="$router.push('/dashboard')"
              class="px-5 py-2.5 bg-linear-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-[15px] font-medium tracking-tight shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all hover:shadow-[0_4px_24px_rgba(99,102,241,0.4)] hover:-translate-y-0.5">
              Dashboard
            </button>
          </template>
          <template v-else>
            <button @click="$router.push('/login')"
              class="px-[18px] py-2 bg-transparent text-white/70 rounded-lg text-[15px] font-medium tracking-tight transition-all hover:bg-white/6 hover:text-white">
              Sign in
            </button>
            <button @click="$router.push('/signup')"
              class="px-5 py-2.5 bg-linear-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-[15px] font-medium tracking-tight shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all hover:shadow-[0_4px_24px_rgba(99,102,241,0.4)] hover:-translate-y-0.5">
              Get Started
            </button>
          </template>
        </div>

        <!-- Mobile Menu Button -->
        <button class="md:hidden flex flex-col gap-[5px] w-8 h-8 p-2 bg-transparent border-none cursor-pointer"
          @click="toggleMobileMenu" aria-label="Toggle menu">
          <span class="w-5 h-0.5 bg-white rounded-sm transition-all duration-300"
            :class="isMobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''"></span>
          <span class="w-5 h-0.5 bg-white rounded-sm transition-all duration-300"
            :class="isMobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''"></span>
        </button>
      </div>

      <!-- Mobile Menu -->
      <transition enter-active-class="transition-all duration-300 ease-in-out"
        enter-from-class="opacity-0 -translate-y-2.5" enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-300 ease-in-out" leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2.5">
        <div v-if="isMobileMenuOpen" class="md:hidden py-6 border-t border-white/6">
          <div class="flex flex-col gap-3">
            <template v-if="isAuthenticated">
              <button @click="handleMobileRoute('/dashboard')"
                class="w-full py-3.5 bg-linear-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-[15px] font-medium tracking-tight shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all hover:shadow-[0_4px_24px_rgba(99,102,241,0.4)]">
                Dashboard
              </button>
            </template>
            <template v-else>
              <button @click="handleMobileRoute('/login')"
                class="w-full py-3.5 bg-white/6 text-white rounded-lg text-[15px] font-medium tracking-tight transition-all hover:bg-white/10">
                Sign in
              </button>
              <button @click="handleMobileRoute('/signup')"
                class="w-full py-3.5 bg-linear-to-r from-indigo-500 to-purple-600 text-white rounded-lg text-[15px] font-medium tracking-tight shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all hover:shadow-[0_4px_24px_rgba(99,102,241,0.4)]">
                Get Started
              </button>
            </template>
          </div>
        </div>
      </transition>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'

const router = useRouter()
const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)
const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const handleMobileRoute = (route: string) => {
  router.push(route)
  isMobileMenuOpen.value = false
  document.body.style.overflow = ''
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.body.style.overflow = ''
})
</script>