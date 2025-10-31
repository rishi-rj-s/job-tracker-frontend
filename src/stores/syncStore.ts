import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useJobStore } from './jobStore'
import { useStatusStore } from './statusStore'
import { usePlatformStore } from './platformStore'
import { useToast } from '@composables/useToast'
import { supabase } from '../lib/supabase'

export const useSyncStore = defineStore('sync', () => {
  const { showToast } = useToast()
  const isSyncing = ref(false)

  async function syncAll() {
    const jobStore = useJobStore()
    const statusStore = useStatusStore()
    const platformStore = usePlatformStore()

    const totalPending = jobStore.pendingCount

    if (totalPending === 0) {
      showToast('No pending changes to sync.', 'gray')
      return
    }

    isSyncing.value = true
    showToast(`Syncing ${totalPending} item(s)...`, 'blue')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const authHeaders = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }

      // Sync statuses
      for (const status of statusStore.pendingStatuses) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/statuses`,
            {
              method: 'POST',
              headers: authHeaders,
              body: JSON.stringify(status)
            }
          )
          if (!response.ok) throw new Error('Failed to sync status')
        } catch (err) {
          console.error('Failed to sync status:', err)
        }
      }
      statusStore.pendingStatuses = []

      // Sync platforms
      for (const platform of platformStore.pendingPlatforms) {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/platforms`,
            {
              method: 'POST',
              headers: authHeaders,
              body: JSON.stringify(platform)
            }
          )
          if (!response.ok) throw new Error('Failed to sync platform')
        } catch (err) {
          console.error('Failed to sync platform:', err)
        }
      }
      platformStore.pendingPlatforms = []

      // Sync jobs
      await jobStore.syncChanges()

      showToast('Sync completed! Refreshing data...', 'green')

      // Refresh data
      await Promise.all([
        statusStore.fetchStatuses(),
        platformStore.fetchPlatforms(),
        jobStore.fetchJobs(jobStore.currentPage)
      ])
    } catch (error: any) {
      console.error('Sync error:', error)
      showToast(error.message || 'Sync failed. Please try again.', 'red')
    } finally {
      isSyncing.value = false
    }
  }

  return { syncAll, isSyncing }
})
