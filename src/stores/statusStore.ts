import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Status } from '@type/index'
import { supabase } from '@lib/supabase'

export const useStatusStore = defineStore('status', () => {
  // Store statuses as Record<key, name> for easy lookup
  const statuses = ref<Record<string, string>>({})
  
  // Track pending additions that need to be synced
  const pendingStatuses = ref<Array<{ key: string; name: string }>>([])
  
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
  async function fetchStatuses() {
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
      
      console.log('📥 Default statuses fetched:', defaultData)

      // Clear and load defaults first
      statuses.value = {}
      defaultStatusKeys.value = []

      // Load all default statuses
      defaultData.forEach((s: Status) => {
        statuses.value[s.key] = s.name
        defaultStatusKeys.value.push(s.key)
      })

      console.log('✅ Default statuses loaded:', Object.keys(statuses.value).length)

      // Step 2: Fetch and merge user custom statuses
      const customResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/statuses/custom`,
        { headers }
      )

      if (customResponse.ok) {
        const customData: Status[] = await customResponse.json()
        
        console.log('📥 Custom statuses fetched:', customData)

        // Merge custom statuses (these will override defaults if same key)
        customData.forEach((s: Status) => {
          statuses.value[s.key] = s.name
          // Don't add to defaultStatusKeys - these are custom
        })

        console.log('✅ Total statuses after merge:', Object.keys(statuses.value).length)
        console.log('📋 All status keys:', Object.keys(statuses.value))
        console.log('🔒 Default status keys:', defaultStatusKeys.value)
      } else {
        console.log('ℹ️ No custom statuses or error fetching them')
      }
      
      return { success: true }
    } catch (err: any) {
      console.error('❌ Error fetching statuses:', err)
      return { success: false, message: err.message }
    }
  }

  // ✅ FIX: Add a new custom status with ORIGINAL name preserved
  async function addStatus(name: string) {
    const originalName = name.trim() // Preserve original capitalization
    const key = createStatusKey(originalName) // Generate normalized key
    
    // Check if key already exists
    if (statuses.value[key]) {
      return { success: false, message: 'Status already exists' }
    }

    // Add optimistically with ORIGINAL name
    statuses.value[key] = originalName
    pendingStatuses.value.push({ key, name: originalName })

    console.log('➕ Status added optimistically:', { key, name: originalName })
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

        console.log('✅ Status synced:', status.name)
      } catch (err) {
        console.error('❌ Failed to sync status:', status.name, err)
        // Keep in pending for retry
      }
    }

    // Refresh to get latest from server
    await fetchStatuses()
  }

  // Delete a custom status
  async function deleteStatus(key: string) {
    // Check if it's a default status
    if (defaultStatusKeys.value.includes(key)) {
      return { success: false, message: 'Cannot delete default status' }
    }

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
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete status')
      }

      // Remove from local store
      delete statuses.value[key]
      
      // Also remove from pending if it's there
      pendingStatuses.value = pendingStatuses.value.filter(s => s.key !== key)
      
      console.log('✅ Status deleted:', key)
      return { success: true }
    } catch (err: any) {
      console.error('❌ Error deleting status:', err)
      return { success: false, message: err.message }
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
    pendingStatuses,
    defaultStatusKeys,
    fetchStatuses,
    addStatus,
    syncStatuses,
    deleteStatus,
    createStatusKey,
    isDefaultStatus
  }
})