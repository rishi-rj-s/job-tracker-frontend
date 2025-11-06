import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Status } from '@type/index'
import { supabase } from '@lib/supabase'

export const useStatusStore = defineStore('status', () => {
  // Store statuses as Record<key, name> for easy lookup
  const statuses = ref<Record<string, string>>({})
  
  // Track pending additions that need to be synced
  const pendingStatuses = ref<Array<{ key: string; name: string }>>([])
  
  // NEW: Flag to track if initial load has completed
  const hasLoadedInitially = ref(false)

  // Track pending deletions that need to be synced
  const pendingDeletes = ref<string[]>([])
  
  // Track which statuses are defaults (can't be deleted)
  const defaultStatusKeys = ref<string[]>([])

  // Get auth headers
  async function getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession()
    return {
      'Authorization': `Bearer ${session?.access_token || ''}`,
      'Content-Type': 'application/json'
    }
  }

  // Fetch all statuses (default + user custom) with default-first strategy
  async function fetchStatuses(force : boolean = false) {

    if (hasLoadedInitially.value && !force) {
    return { success: true }
  }
    try {
      const headers = await getAuthHeaders()
      
      // Step 1: Fetch and load default statuses FIRST
      const defaultResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/statuses/defaults`,
        { headers }
      )

      if (!defaultResponse.ok) {
        throw new Error('Failed to fetch default statuses')
      }

      const defaultData: Status[] = await defaultResponse.json()
      

      // Clear and load defaults first
      statuses.value = {}
      defaultStatusKeys.value = []

      // Load all default statuses
      defaultData.forEach((s: Status) => {
        statuses.value[s.key] = s.name
        defaultStatusKeys.value.push(s.key)
      })


      // Step 2: Fetch and merge user custom statuses
      const customResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/statuses/custom`,
        { headers }
      )

      if (customResponse.ok) {
        const customData: Status[] = await customResponse.json()
        

        // Merge custom statuses (these will override defaults if same key)
        customData.forEach((s: Status) => {
          statuses.value[s.key] = s.name
          // Don't add to defaultStatusKeys - these are custom
        })

      } else {
      }
      hasLoadedInitially.value = true
      return { success: true }
    } catch (err: any) {
      return { success: false, message: err.message }
    }
  }

  // Add a new custom status with ORIGINAL name preserved
  async function addStatus(name: string): Promise<{ success: boolean; message?: string; key?: string; name?: string }> {
    const originalName = name.trim() // Preserve original capitalization
    const key = createStatusKey(originalName) // Generate normalized key
    
    // Check if key already exists
    if (statuses.value[key]) {
      return { success: false, message: 'Status already exists' }
    }

    // Add optimistically with ORIGINAL name
    statuses.value[key] = originalName
    pendingStatuses.value.push({ key, name: originalName })

    return { success: true, key, name: originalName }
  }

  // Sync pending statuses to backend
  async function syncStatuses() {
    const headers = await getAuthHeaders()

    for (const status of [...pendingStatuses.value]) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/statuses`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({
              key: status.key,
              name: status.name // Use the original name
            })
          }
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create status')
        }

        // Remove from pending on success
        pendingStatuses.value = pendingStatuses.value.filter(
          s => s.key !== status.key
        )

      } catch (err) {
        // Keep in pending for retry
      }
    }

    // Refresh to get latest from server
    await fetchStatuses()
  }

  // Delete a custom status - OPTIMISTIC
  async function deleteStatus(key: string): Promise<{ success: boolean; message?: string; requiresSync?: boolean }> {
    // Check if it's a default status
    if (defaultStatusKeys.value.includes(key)) {
      return { success: false, message: 'Cannot delete default status' }
    }

    // OPTIMISTIC: Remove from UI immediately
    const originalName = statuses.value[key]
    delete statuses.value[key]
    
    // Also remove from pending additions if it's there
    pendingStatuses.value = pendingStatuses.value.filter(s => s.key !== key)

    // Try to sync immediately in background
    try {
      const headers = await getAuthHeaders()
      

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/statuses`,
        {
          method: 'DELETE',
          headers,
          body: JSON.stringify({ key })
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete status')
      }

      return { success: true }
      
    } catch (err: any) {
      
      // On failure: restore and add to pending deletes
      if (originalName) {
        statuses.value[key] = originalName
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
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/statuses`,
          {
            method: 'DELETE',
            headers,
            body: JSON.stringify({ key })
          }
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to delete status')
        }

        // Remove from pending on success
        pendingDeletes.value = pendingDeletes.value.filter(k => k !== key)

      } catch (err) {
        // Keep in pending for retry
      }
    }
  }

  // Create a valid key from a name (normalized, lowercase, hyphenated)
  function createStatusKey(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  // Check if a status is default (can't be deleted)
  function isDefaultStatus(key: string): boolean {
    return defaultStatusKeys.value.includes(key)
  }

  return {
    statuses,
    hasLoadedInitially,
    pendingStatuses,
    pendingDeletes,
    defaultStatusKeys,
    fetchStatuses,
    addStatus,
    syncStatuses,
    syncDeletes,
    deleteStatus,
    createStatusKey,
    isDefaultStatus
  }
})