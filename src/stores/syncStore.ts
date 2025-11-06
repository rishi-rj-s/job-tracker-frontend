import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useJobStore } from './jobStore'
import { useStatusStore } from './statusStore'
import { usePlatformStore } from './platformStore'
import { useToast } from '@/composables/useToast'

export const useSyncStore = defineStore('sync', () => {
  const { showToast } = useToast()
  const isSyncing = ref(false)

  async function syncAll() {
    const jobStore = useJobStore()
    const statusStore = useStatusStore()
    const platformStore = usePlatformStore()

    // Calculate total pending INCLUDING DELETIONS
    const totalPending = 
      jobStore.pendingCount + 
      statusStore.pendingStatuses.length + 
      platformStore.pendingPlatforms.length +
      statusStore.pendingDeletes.length +
      platformStore.pendingDeletes.length

    if (totalPending === 0) {
      showToast('No pending changes to sync.', 'gray')
      return
    }

    isSyncing.value = true
    showToast(`Syncing ${totalPending} item(s)...`, 'blue')

    try {
      // Sync status deletions first
      if (statusStore.pendingDeletes.length > 0) {
        await statusStore.syncDeletes()
      }

      // Sync status additions
      if (statusStore.pendingStatuses.length > 0) {
        await statusStore.syncStatuses()
      }

      // Sync platform deletions
      if (platformStore.pendingDeletes.length > 0) {
        await platformStore.syncDeletes()
      }

      // Sync platform additions
      if (platformStore.pendingPlatforms.length > 0) {
        await platformStore.syncPlatforms()
      }

      // Sync jobs (already has sync built in)
      if (jobStore.pendingCount > 0) {
        await jobStore.syncChanges()
      }

      showToast('Sync completed successfully!', 'green')

      // Refresh data after sync
      await Promise.all([
        statusStore.fetchStatuses(),
        platformStore.fetchPlatforms(),
        jobStore.fetchJobs(jobStore.currentPage)
      ])

    } catch (error: any) {
      showToast(error.message || 'Sync failed. Please try again.', 'red')
    } finally {
      isSyncing.value = false
    }
  }

  return { syncAll, isSyncing }
})