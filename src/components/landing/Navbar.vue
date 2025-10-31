<template>
  <nav class="navbar" :class="{ 'scrolled': isScrolled }">
    <div class="container">
      <div class="nav-content">
        <!-- Logo -->
        <div class="logo" @click="$router.push(isAuthenticated ? '/dashboard' : '/')">
          <Briefcase class="logo-icon" />
          <span class="logo-text">ApplyLog</span>
        </div>

        <!-- Desktop Navigation -->
        <div class="nav-links desktop-nav">
          <a href="#features" @click.prevent="scrollToSection('features')" class="nav-link">
            Features
          </a>
          <a href="#how-it-works" @click.prevent="scrollToSection('how-it-works')" class="nav-link">
            How It Works
          </a>
        </div>

        <!-- Desktop Actions -->
        <div class="nav-actions desktop-nav">
          <template v-if="isAuthenticated">
            <button @click="$router.push('/dashboard')" class="btn-dashboard">
              Go to Dashboard
            </button>
          </template>
          <template v-else>
            <button @click="$router.push('/login')" class="btn-login">
              Log In
            </button>
            <button @click="$router.push('/signup')" class="btn-signup">
              Sign Up
            </button>
          </template>
        </div>

        <!-- Mobile Menu Button -->
        <button class="mobile-menu-btn" @click="toggleMobileMenu" aria-label="Toggle menu">
          <Menu v-if="!isMobileMenuOpen" class="menu-icon" />
          <X v-else class="menu-icon" />
        </button>
      </div>

      <!-- Mobile Menu -->
      <transition name="mobile-menu">
        <div v-if="isMobileMenuOpen" class="mobile-menu">
          <div class="mobile-links">
            <a href="#features" @click="handleMobileClick('features')" class="mobile-link">
              Features
            </a>
            <a href="#how-it-works" @click="handleMobileClick('how-it-works')" class="mobile-link">
              How It Works
            </a>
          </div>
          <div class="mobile-actions">
            <template v-if="isAuthenticated">
              <button @click="handleMobileRoute('/dashboard')" class="mobile-btn-dashboard">
                Go to Dashboard
              </button>
            </template>
            <template v-else>
              <button @click="handleMobileRoute('/login')" class="mobile-btn-login">
                Log In
              </button>
              <button @click="handleMobileRoute('/signup')" class="mobile-btn-signup">
                Sign Up
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
import { Briefcase, Menu, X } from 'lucide-vue-next'
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

const scrollToSection = (sectionId: string) => {
  const element = document.querySelector(`.${sectionId}`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  // Prevent body scroll when mobile menu is open
  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const handleMobileClick = (sectionId: string) => {
  scrollToSection(sectionId)
  isMobileMenuOpen.value = false
  document.body.style.overflow = ''
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

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(17, 24, 39, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #374151;
  transition: all 0.3s ease;
}

.navbar.scrolled {
  background: rgba(17, 24, 39, 0.98);
  border-bottom-color: #4b5563;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.logo:hover {
  opacity: 0.8;
}

.logo-icon {
  width: 28px;
  height: 28px;
  color: #a78bfa;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
}

/* Desktop Navigation */
.desktop-nav {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-links {
  gap: 32px;
}

.nav-link {
  color: #d1d5db;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: color 0.2s;
  cursor: pointer;
}

.nav-link:hover {
  color: #a78bfa;
}

/* Desktop Actions */
.nav-actions {
  gap: 12px;
}

.btn-login {
  padding: 8px 20px;
  background: transparent;
  color: #d1d5db;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}

.btn-login:hover {
  background: #374151;
  color: #ffffff;
}

.btn-signup,
.btn-dashboard {
  padding: 8px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-signup:hover,
.btn-dashboard:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Mobile Menu Button */
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: #d1d5db;
}

.menu-icon {
  width: 24px;
  height: 24px;
}

/* Mobile Menu */
.mobile-menu {
  display: none;
  padding: 20px 0;
  border-top: 1px solid #374151;
  background: #111827;
}

.mobile-links {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 20px;
}

.mobile-link {
  color: #d1d5db;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 500;
  padding: 12px 0;
  transition: color 0.2s;
  cursor: pointer;
}

.mobile-link:hover {
  color: #a78bfa;
}

.mobile-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-btn-login,
.mobile-btn-signup,
.mobile-btn-dashboard {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.mobile-btn-login {
  background: #374151;
  color: #ffffff;
}

.mobile-btn-login:hover {
  background: #4b5563;
}

.mobile-btn-signup,
.mobile-btn-dashboard {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.mobile-btn-signup:hover,
.mobile-btn-dashboard:hover {
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Mobile Menu Animation */
.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.3s ease;
}

.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .desktop-nav {
    display: none;
  }

  .mobile-menu-btn {
    display: block;
  }

  .mobile-menu {
    display: block;
  }

  .nav-content {
    height: 60px;
  }

  .logo-text {
    font-size: 1.125rem;
  }

  .logo-icon {
    width: 24px;
    height: 24px;
  }
}

@media (min-width: 769px) {
  .mobile-menu {
    display: none !important;
  }
}
</style>