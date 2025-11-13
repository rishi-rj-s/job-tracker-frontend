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

  function incrementJobAdded(status: string, platforms: string[], dateApplied?: string) {
    // Increment total
    stats.value.total++
    
    // Increment status breakdown
    const statusKey = status.toLowerCase()
    stats.value.statusBreakdown[statusKey] = (stats.value.statusBreakdown[statusKey] || 0) + 1
    
    // Increment platform breakdown
    platforms.forEach(platform => {
      stats.value.platformBreakdown[platform] = (stats.value.platformBreakdown[platform] || 0) + 1
    })
    
    // Update top platforms
    updateTopPlatforms()
    
    // Check if added this week/month
    if (dateApplied) {
      const appliedDate = new Date(dateApplied)
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1)
      
      if (appliedDate >= weekAgo) {
        stats.value.thisWeek++
      }
      if (appliedDate >= monthAgo) {
        stats.value.thisMonth++
      }
    }
  }

  function decrementJobDeleted(status: string, platforms: string[], dateApplied?: string) {
    // Decrement total
    stats.value.total = Math.max(0, stats.value.total - 1)
    
    // Decrement status breakdown
    const statusKey = status.toLowerCase()
    stats.value.statusBreakdown[statusKey] = Math.max(0, (stats.value.statusBreakdown[statusKey] || 0) - 1)
    
    // Decrement platform breakdown
    platforms.forEach(platform => {
      stats.value.platformBreakdown[platform] = Math.max(0, (stats.value.platformBreakdown[platform] || 0) - 1)
    })
    
    // Update top platforms
    updateTopPlatforms()
    
    // Check if was added this week/month
    if (dateApplied) {
      const appliedDate = new Date(dateApplied)
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1)
      
      if (appliedDate >= weekAgo) {
        stats.value.thisWeek = Math.max(0, stats.value.thisWeek - 1)
      }
      if (appliedDate >= monthAgo) {
        stats.value.thisMonth = Math.max(0, stats.value.thisMonth - 1)
      }
    }
  }

  function updateJobStatus(oldStatus: string, newStatus: string) {
    const oldKey = oldStatus.toLowerCase()
    const newKey = newStatus.toLowerCase()
    
    // Decrement old status
    stats.value.statusBreakdown[oldKey] = Math.max(0, (stats.value.statusBreakdown[oldKey] || 0) - 1)
    
    // Increment new status
    stats.value.statusBreakdown[newKey] = (stats.value.statusBreakdown[newKey] || 0) + 1
  }

  function updateJobPlatforms(oldPlatforms: string[], newPlatforms: string[]) {
    // Decrement old platforms
    oldPlatforms.forEach(platform => {
      stats.value.platformBreakdown[platform] = Math.max(0, (stats.value.platformBreakdown[platform] || 0) - 1)
    })
    
    // Increment new platforms
    newPlatforms.forEach(platform => {
      stats.value.platformBreakdown[platform] = (stats.value.platformBreakdown[platform] || 0) + 1
    })
    
    // Update top platforms
    updateTopPlatforms()
  }

  function updateTopPlatforms() {
    stats.value.topPlatforms = Object.entries(stats.value.platformBreakdown)
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5) // Top 5 platforms
  }

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
    incrementJobAdded,
    decrementJobDeleted,
    updateJobStatus,
    updateJobPlatforms,
    invalidateStats
  }
})