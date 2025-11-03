// lib/supabase.ts (FIXED VERSION)
import { createClient } from '@supabase/supabase-js'

// Environment variables with fallbacks and validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Validate environment variables
if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL is not set in .env file')
  throw new Error('Missing VITE_SUPABASE_URL environment variable')
}

if (!supabaseKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not set in .env file')
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable')
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch {
  console.error('❌ VITE_SUPABASE_URL is not a valid URL:', supabaseUrl)
  throw new Error('Invalid VITE_SUPABASE_URL format')
}

console.log('✅ Supabase client initialized successfully')
console.log('📍 URL:', supabaseUrl)

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'jobtracker-auth',
  },
  global: {
    headers: {
      'X-Client-Info': 'jobtracker-app'
    }
  }
})

// Helper function to check if Supabase is configured correctly
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      console.error('Supabase connection check failed:', error)
      return false
    }
    console.log('✅ Supabase connection is working')
    return true
  } catch (err) {
    console.error('Supabase connection error:', err)
    return false
  }
}