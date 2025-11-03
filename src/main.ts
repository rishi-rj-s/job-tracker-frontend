import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@vueuse/head'
import App from './App.vue'
import router from './router'
import './assets/styles.css'
import { setupProgress } from './plugins/nprogress'


const app = createApp(App)
const pinia = createPinia()
const head = createHead()

// Register plugins
app.use(pinia)
app.use(router)
setupProgress(router)
app.use(head)

// Mount app
app.mount('#app')

// Development logging
if (import.meta.env.DEV) {
  console.log('🚀 JobTracker App Initialized')
  console.log('📍 Environment:', import.meta.env.MODE)
  console.log('🔑 Supabase URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing')
  console.log('🔑 Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing')
}