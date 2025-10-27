import { defineStore } from 'pinia'
import { useJobStore } from './jobStore'
import { useStatusStore } from './statusStore'
import { usePlatformStore } from './platformStore'
import { useToast } from '../lib/composables/useToast'
import { supabase } from '../lib/supabase'

export const useSyncStore = defineStore('sync', () => {
  const { showToast } = useToast()

  async function syncAll() {
    const jobStore = useJobStore()
    const statusStore = useStatusStore()
    const platformStore = usePlatformStore()

    const totalPending = jobStore.pendingCount

    if (totalPending === 0) {
      showToast('No pending changes to sync.', 'gray')
      return
    }

    showToast(`Syncing ${totalPending} item(s)...`, 'blue')

    for (const status of statusStore.pendingStatuses) {
      try {
        await supabase.functions.invoke('statuses', {
          method: 'POST',
          body: status
        })
      } catch (err) {
        console.error('Failed to sync status:', err)
      }
    }
    statusStore.pendingStatuses = []

    for (const platform of platformStore.pendingPlatforms) {
      try {
        await supabase.functions.invoke('platforms', {
          method: 'POST',
          body: platform
        })
      } catch (err) {
        console.error('Failed to sync platform:', err)
      }
    }
    platformStore.pendingPlatforms = []

    await jobStore.syncChanges()

    showToast('Sync completed! Refreshing data...', 'green')

    await statusStore.fetchStatuses()
    await platformStore.fetchPlatforms()
    await jobStore.fetchJobs(jobStore.currentPage)
  }

  return { syncAll }
})