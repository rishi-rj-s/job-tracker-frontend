import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Platform } from '@type/index'
import { supabase } from '@lib/supabase'

export const usePlatformStore = defineStore('platform', () => {
  // Store platforms as Record<key, name> for easy lookup
  const platforms = ref<Record<string, string>>({})
  
  // Track pending additions that need to be synced
  const pendingPlatforms = ref<Array<{ key: string; name: string }>>([])
  
  // Track which platforms are defaults (can't be deleted)
  const defaultPlatformKeys = ref<string[]>([])

  // Get auth headers
  async function getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession()
    return {
      'Authorization': `Bearer ${session?.access_token || ''}`,
      'Content-Type': 'application/json'
    }
  }

  // Fetch all platforms (default + user custom) with default-first strategy
  async function fetchPlatforms() {
    try {
      const headers = await getAuthHeaders()
      
      // Step 1: Fetch and load default platforms FIRST
      const defaultResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/platforms/defaults`,
        { headers }
      )

      if (!defaultResponse.ok) {
        throw new Error('Failed to fetch default platforms')
      }

      const defaultData: Platform[] = await defaultResponse.json()
      
      console.log('📥 Default platforms fetched:', defaultData)

      // Clear and load defaults first
      platforms.value = {}
      defaultPlatformKeys.value = []

      // Load all default platforms
      defaultData.forEach((p: Platform) => {
        platforms.value[p.key] = p.name
        defaultPlatformKeys.value.push(p.key)
      })

      console.log('✅ Default platforms loaded:', Object.keys(platforms.value).length)

      // Step 2: Fetch and merge user custom platforms
      const customResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/platforms/custom`,
        { headers }
      )

      if (customResponse.ok) {
        const customData: Platform[] = await customResponse.json()
        
        console.log('📥 Custom platforms fetched:', customData)

        // Merge custom platforms (these will override defaults if same key)
        customData.forEach((p: Platform) => {
          platforms.value[p.key] = p.name
          // Don't add to defaultPlatformKeys - these are custom
        })

        console.log('✅ Total platforms after merge:', Object.keys(platforms.value).length)
        console.log('📋 All platform keys:', Object.keys(platforms.value))
        console.log('🔒 Default platform keys:', defaultPlatformKeys.value)
      } else {
        console.log('ℹ️ No custom platforms or error fetching them')
      }
      
      return { success: true }
    } catch (err: any) {
      console.error('❌ Error fetching platforms:', err)
      return { success: false, message: err.message }
    }
  }

  // ✅ FIX: Add a new custom platform with ORIGINAL name preserved
  async function addPlatform(name: string) {
    const originalName = name.trim() // Preserve original capitalization
    const key = createPlatformKey(originalName) // Generate normalized key
    
    // Check if key already exists
    if (platforms.value[key]) {
      return { success: false, message: 'Platform already exists' }
    }

    // Add optimistically with ORIGINAL name
    platforms.value[key] = originalName
    pendingPlatforms.value.push({ key, name: originalName })

    console.log('➕ Platform added optimistically:', { key, name: originalName })
    return { success: true, key, name: originalName }
  }

  // Sync pending platforms to backend
  async function syncPlatforms() {
    const headers = await getAuthHeaders()

    for (const platform of [...pendingPlatforms.value]) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/platforms`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({
              key: platform.key,
              name: platform.name // Use the original name
            })
          }
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create platform')
        }

        // Remove from pending on success
        pendingPlatforms.value = pendingPlatforms.value.filter(
          p => p.key !== platform.key
        )

        console.log('✅ Platform synced:', platform.name)
      } catch (err) {
        console.error('❌ Failed to sync platform:', platform.name, err)
        // Keep in pending for retry
      }
    }

    // Refresh to get latest from server
    await fetchPlatforms()
  }

  // Delete a custom platform
  async function deletePlatform(key: string) {
    // Check if it's a default platform
    if (defaultPlatformKeys.value.includes(key)) {
      return { success: false, message: 'Cannot delete default platform' }
    }

    try {
      const headers = await getAuthHeaders()
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/platforms`,
        {
          method: 'DELETE',
          headers,
          body: JSON.stringify({ key })
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete platform')
      }

      // Remove from local store
      delete platforms.value[key]
      
      // Also remove from pending if it's there
      pendingPlatforms.value = pendingPlatforms.value.filter(p => p.key !== key)
      
      console.log('✅ Platform deleted:', key)
      return { success: true }
    } catch (err: any) {
      console.error('❌ Error deleting platform:', err)
      return { success: false, message: err.message }
    }
  }

  // Create a valid key from a name (normalized, lowercase, hyphenated)
  function createPlatformKey(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  // Check if a platform is default (can't be deleted)
  function isDefaultPlatform(key: string): boolean {
    return defaultPlatformKeys.value.includes(key)
  }

  return {
    platforms,
    pendingPlatforms,
    defaultPlatformKeys,
    fetchPlatforms,
    addPlatform,
    syncPlatforms,
    deletePlatform,
    createPlatformKey,
    isDefaultPlatform
  }
})