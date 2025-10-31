import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@stores/authStore'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'landing',
    component: () => import('@views/Landing.vue'),
    meta: { 
      title: 'JobTracker - Track Your Job Applications Like a Pro',
    }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@views/Login.vue'),
    meta: { 
      title: 'Login - JobTracker',
      requiresGuest: true 
    }
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('@views/Signup.vue'),
    meta: { 
      title: 'Sign Up - JobTracker',
      requiresGuest: true 
    }
  },
  {
    path: '/auth/callback',
    name: 'auth-callback',
    component: () => import('@views/AuthCallback.vue'),
    meta: { 
      title: 'Authenticating...'
    }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@views/Dashboard.vue'),
    meta: { 
      title: 'Dashboard - JobTracker',
      // requiresAuth: true 
    },
    children: [
      {
        path: '',
        name: 'dashboard-home',
        component: () => import('@components/dashboard/home/DashboardHome.vue'),
        meta: { 
          title: 'Dashboard - JobTracker'
        }
      },
      {
        path: 'jobs',
        name: 'jobs-applied',
        component: () => import('@views/Jobs.vue'),
        meta: { 
          title: 'My Applications - JobTracker'
        }
      },
      {
        path: 'calendar',
        name: 'calendar',
        component: () => import('@components/dashboard/calendar/CalendarPage.vue'),
        meta: { 
          title: 'Calendar - JobTracker'
        }
      },
      {
        path: 'analytics',
        name: 'analytics',
        component: () => import('@components/dashboard/analytics/AnalyticsPage.vue'),
        meta: { 
          title: 'Analytics - JobTracker'
        }
      },
      {
        path: 'contacts',
        name: 'contacts',
        component: () => import('@components/dashboard/contacts/ContactsPage.vue'),
        meta: { 
          title: 'Contacts - JobTracker'
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@views/NotFound.vue'),
    meta: { 
      title: '404 - Page Not Found'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    } else {
      return { top: 0 }
    }
  }
})

// Navigation Guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Set page title
  document.title = (to.meta.title as string) || 'JobTracker'

  // Wait for auth initialization on first load
  if (authStore.loading) {
    let attempts = 0
    const maxAttempts = 50
    
    while (authStore.loading && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }
  }

  const requiresAuth = to.meta.requiresAuth
  const requiresGuest = to.meta.requiresGuest
  const isAuthenticated = authStore.isAuthenticated

  // Redirect authenticated users away from guest pages
  if (requiresGuest && isAuthenticated) {
    console.log('🔒 Redirecting authenticated user away from guest page')
    next({ name: 'dashboard-home' })
    return
  }

  // Redirect unauthenticated users to login
  if (requiresAuth && !isAuthenticated) {
    console.log('🔒 Redirecting unauthenticated user to login')
    next({ 
      name: 'login',
      query: { redirect: to.fullPath }
    })
    return
  }

  next()
})

// Handle auth callback redirects
router.afterEach((to, from) => {
  if (import.meta.env.DEV) {
    console.log(`📍 Navigated: ${from.path} → ${to.path}`)
  }
})

export default router