import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Platform } from '@type/index'
import { supabase } from '@lib/supabase'

export const usePlatformStore = defineStore('platform', () => {
  // Store platforms as Record<key, name> for easy lookup
  const platforms = ref<Record<string, string>>({})

  // NEW: Flag to track if initial load has completed
  const hasLoadedInitially = ref(false)

  // Track pending additions that need to be synced
  const pendingPlatforms = ref<Array<{ key: string; name: string }>>([])
  
  // Track pending deletions that need to be synced
  const pendingDeletes = ref<string[]>([])
  
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
  async function fetchPlatforms(force : boolean = false) {
    if (hasLoadedInitially.value && !force) {
    return { success: true }
  }

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
      

      // Clear and load defaults first
      platforms.value = {}
      defaultPlatformKeys.value = []

      // Load all default platforms
      defaultData.forEach((p: Platform) => {
        platforms.value[p.key] = p.name
        defaultPlatformKeys.value.push(p.key)
      })


      // Step 2: Fetch and merge user custom platforms
      const customResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/platforms/custom`,
        { headers }
      )

      if (customResponse.ok) {
        const customData: Platform[] = await customResponse.json()
        

        // Merge custom platforms (these will override defaults if same key)
        customData.forEach((p: Platform) => {
          platforms.value[p.key] = p.name
          // Don't add to defaultPlatformKeys - these are custom
        })

      } else {
      }
      hasLoadedInitially.value = true
      return { success: true }
    } catch (err: any) {
      return { success: false, message: err.message }
    }
  }

  // Add a new custom platform with ORIGINAL name preserved
  async function addPlatform(name: string): Promise<{ success: boolean; message?: string; key?: string; name?: string }> {
    const originalName = name.trim() // Preserve original capitalization
    const key = createPlatformKey(originalName) // Generate normalized key
    
    // Check if key already exists
    if (platforms.value[key]) {
      return { success: false, message: 'Platform already exists' }
    }

    // Add optimistically with ORIGINAL name
    platforms.value[key] = originalName
    pendingPlatforms.value.push({ key, name: originalName })

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

      } catch (err) {
        // Keep in pending for retry
      }
    }

    // Refresh to get latest from server
    await fetchPlatforms()
  }

  // Delete a custom platform - OPTIMISTIC
  async function deletePlatform(key: string): Promise<{ success: boolean; message?: string; requiresSync?: boolean }> {
    // Check if it's a default platform
    if (defaultPlatformKeys.value.includes(key)) {
      return { success: false, message: 'Cannot delete default platform' }
    }

    // OPTIMISTIC: Remove from UI immediately
    const originalName = platforms.value[key]
    delete platforms.value[key]
    
    // Also remove from pending additions if it's there
    pendingPlatforms.value = pendingPlatforms.value.filter(p => p.key !== key)

    // Try to sync immediately in background
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
        throw new Error('Failed to delete platform')
      }

      return { success: true }
      
    } catch (err: any) {
      
      // On failure: restore and add to pending deletes
      if (originalName) {
        platforms.value[key] = originalName
      }
      pendingDeletes.value.push(key)
      
      return { success: true, requiresSync: true }
    }
  }

  // Sync pending deletions to backend
  async function syncDeletes() {
    const headers = await getAuthHeaders()

    for (const key of [...pendingDeletes.value]) {
      try {
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

        // Remove from pending on success
        pendingDeletes.value = pendingDeletes.value.filter(k => k !== key)

      } catch (err) {
        // Keep in pending for retry
      }
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
    hasLoadedInitially,
    pendingPlatforms,
    pendingDeletes,
    defaultPlatformKeys,
    fetchPlatforms,
    addPlatform,
    syncPlatforms,
    syncDeletes,
    deletePlatform,
    createPlatformKey,
    isDefaultPlatform
  }
})