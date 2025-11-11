// lib/supabase.ts (FIXED VERSION)
import { createClient } from '@supabase/supabase-js'

// Environment variables with fallbacks and validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('Missing VITE_SUPABASE_URL environment variable')
}

if (!supabaseKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable')
}

// Validate URL format
try {
  new URL(supabaseUrl)
} catch {
  throw new Error('Invalid VITE_SUPABASE_URL format')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.sessionStorage,
    storageKey: 'applylog-auth',
  },
  global: {
    headers: {
      'X-Client-Info': 'applylog-app'
    }
  }
})

// Helper function to check if Supabase is configured correctly
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) {
      return false
    }
    return true
  } catch (err) {
    return false
  }
}