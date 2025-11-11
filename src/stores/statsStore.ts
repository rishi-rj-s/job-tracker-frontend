import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@lib/supabase'

interface JobStats {
  total: number
  statusBreakdown: Record<string, number>
  platformBreakdown: Record<string, number>
  topPlatforms: Array<{ key: string; count: number }>
  thisWeek: number
  thisMonth: number
  upcomingActions: number
}

export const useStatsStore = defineStore('stats', () => {
  const stats = ref<JobStats>({
    total: 0,
    statusBreakdown: {},
    platformBreakdown: {},
    topPlatforms: [],
    thisWeek: 0,
    thisMonth: 0,
    upcomingActions: 0
  })

  const isLoading = ref(false)
  const hasLoadedInitially = ref(false)

  // Computed getters for easy access
  const totalJobs = computed(() => stats.value.total)
  
  const appliedCount = computed(() => {
    return stats.value.statusBreakdown['applied'] || 0
  })

  const screeningCount = computed(() => {
    return stats.value.statusBreakdown['screening'] || 0
  })

  const interviewCount = computed(() => {
    return stats.value.statusBreakdown['interview'] || 0
  })

  const offerCount = computed(() => {
    return stats.value.statusBreakdown['offer'] || 0
  })

  const rejectedCount = computed(() => {
    return stats.value.statusBreakdown['rejected'] || 0
  })

  const closedCount = computed(() => {
    return stats.value.statusBreakdown['closed'] || 0
  })

  // Get count for any status key (case-insensitive)
  function getStatusCount(statusKey: string): number {
    return stats.value.statusBreakdown[statusKey.toLowerCase()] || 0
  }

  // Get count for any platform key
  function getPlatformCount(platformKey: string): number {
    return stats.value.platformBreakdown[platformKey] || 0
  }

  async function getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession()
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token || ''}`
    }
  }

  // Fetch statistics from backend
  async function fetchStats(forceRefresh = false) {
    // Skip if we have data and not forcing refresh
    if (!forceRefresh && hasLoadedInitially.value) {
      return { success: true }
    }

    isLoading.value = true

    try {
      const headers = await getAuthHeaders()
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/jobStats`,
        { headers }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch statistics')
      }

      const data = await response.json()
      
      stats.value = {
        total: data.total || 0,
        statusBreakdown: data.statusBreakdown || {},
        platformBreakdown: data.platformBreakdown || {},
        topPlatforms: data.topPlatforms || [],
        thisWeek: data.thisWeek || 0,
        thisMonth: data.thisMonth || 0,
        upcomingActions: data.upcomingActions || 0
      }

      hasLoadedInitially.value = true

      return { success: true }
    } catch (err: any) {
      console.error('Failed to fetch stats:', err)
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  // Invalidate stats cache (call this after adding/updating/deleting jobs)
  function invalidateStats() {
    hasLoadedInitially.value = false
  }

  return {
    stats,
    isLoading,
    hasLoadedInitially,
    totalJobs,
    appliedCount,
    screeningCount,
    interviewCount,
    offerCount,
    rejectedCount,
    closedCount,
    getStatusCount,
    getPlatformCount,
    fetchStats,
    invalidateStats
  }
})