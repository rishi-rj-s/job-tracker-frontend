import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ExportFormat, Job } from '@type/index'
import { supabase } from '@lib/supabase'
import { useStatusStore } from './statusStore'
import { usePlatformStore } from './platformStore'
import { useStatsStore } from './statsStore'

interface SearchParams {
  query?: string
  status?: string
  platform?: string
  dateFrom?: string
  dateTo?: string
  sortBy?: string
  sortOrder?: string
  page?: number
  limit?: number
}

export const useJobStore = defineStore('job', () => {
  const jobs = ref<Job[]>([])
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalItems = ref(0)
  const pageSize = 10
  const isLoading = ref(false)
  const connectionStatus = ref<'loading' | 'success' | 'error'>('loading')
  const errorMessage = ref('')
  const hasLoadedInitially = ref(false)
  const activeSearchParams = ref<SearchParams | null>(null)
  const pendingJobs = ref<Job[]>([])
  const pendingUpdates = ref<{ id: string; tempId: string; data: Partial<Job> }[]>([])
  const pendingDeletes = ref<{ id: string }[]>([])

  const hasPendingChanges = computed(() => {
    return pendingJobs.value.length + pendingUpdates.value.length + pendingDeletes.value.length > 0
  })

  const pendingCount = computed(() => {
    return pendingJobs.value.length + pendingUpdates.value.length + pendingDeletes.value.length
  })

  function generateTempId() {
    return `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }

  async function getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession()
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token || ''}`
    }
  }

  function prepareJobDataForBackend(job: Partial<Job>) {
    const statusStore = useStatusStore()
    const platformStore = usePlatformStore()

    const data: any = { ...job }

    if (job.status) {
      data.status = job.status
      data.statusName = statusStore.statuses[job.status] || job.status
      data.statusMetadata = {
        key: job.status,
        name: statusStore.statuses[job.status] || job.status
      }
    }

    if (job.applicationPlatforms && Array.isArray(job.applicationPlatforms)) {
      data.applicationPlatforms = job.applicationPlatforms
      data.platformsMetadata = job.applicationPlatforms.map(key => ({
        key: key,
        name: platformStore.platforms[key] || key
      }))
    }

    return data
  }

  async function fetchJobs(page = 1, forceRefresh = false) {
    if (!forceRefresh && hasLoadedInitially.value && jobs.value.length > 0 && page === currentPage.value) {
      return
    }

    isLoading.value = true
    connectionStatus.value = 'loading'
    activeSearchParams.value = null

    try {
      const headers = await getAuthHeaders()
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/jobs?page=${page}&limit=${pageSize}`,
        { headers }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch jobs')
      }

      const data = await response.json()

      let serverJobs = data.jobs.map((j: Job) => ({ ...j, isPending: false }))

      currentPage.value = data.pagination.currentPage
      totalPages.value = data.pagination.totalPages
      totalItems.value = data.pagination.totalItems

      serverJobs = serverJobs.filter((sj: Job) =>
        !pendingDeletes.value.some(pd => pd.id === (sj._id || sj.id))
      )

      if (page === 1) {
        const jobsForMerge = pendingJobs.value.filter(j =>
          !serverJobs.some((cj: Job) => cj.jobTitle === j.jobTitle && cj.company === j.company)
        )
        serverJobs.unshift(...jobsForMerge)
      }

      serverJobs = serverJobs.map((job: Job) => {
        const jobId = job._id || job.id
        const pendingUpdate = pendingUpdates.value.find(pu =>
          (pu.id === jobId || pu.tempId === jobId)
        )
        if (pendingUpdate) {
          return { ...job, ...pendingUpdate.data, isPending: true }
        }
        return job
      })

      jobs.value = serverJobs
      connectionStatus.value = 'success'
      hasLoadedInitially.value = true

    } catch (err: any) {
      connectionStatus.value = 'error'
      errorMessage.value = err.message || 'Connection failed'
    } finally {
      isLoading.value = false
    }
  }

  async function searchJobs(params: SearchParams) {
    isLoading.value = true
    connectionStatus.value = 'loading'
    activeSearchParams.value = params

    try {
      const headers = await getAuthHeaders()

      const queryParams = new URLSearchParams()
      if (params.query) queryParams.append('q', params.query)
      if (params.status) queryParams.append('status', params.status)
      if (params.platform) queryParams.append('platform', params.platform)
      if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom)
      if (params.dateTo) queryParams.append('dateTo', params.dateTo)
      if (params.sortBy) queryParams.append('sortBy', params.sortBy)
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder)
      queryParams.append('page', String(params.page || 1))
      queryParams.append('limit', String(params.limit || pageSize))

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/search?${queryParams}`,
        { headers }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to search jobs')
      }

      const data = await response.json()

      let serverJobs = data.jobs.map((j: Job) => ({ ...j, isPending: false }))

      currentPage.value = data.pagination.currentPage
      totalPages.value = data.pagination.totalPages
      totalItems.value = data.pagination.totalItems

      serverJobs = serverJobs.filter((sj: Job) =>
        !pendingDeletes.value.some(pd => pd.id === (sj._id || sj.id))
      )

      serverJobs = serverJobs.map((job: Job) => {
        const jobId = job._id || job.id
        const pendingUpdate = pendingUpdates.value.find(pu =>
          (pu.id === jobId || pu.tempId === jobId)
        )
        if (pendingUpdate) {
          return { ...job, ...pendingUpdate.data, isPending: true }
        }
        return job
      })

      jobs.value = serverJobs
      connectionStatus.value = 'success'

      return { success: true, data: serverJobs }
    } catch (err: any) {
      connectionStatus.value = 'error'
      errorMessage.value = err.message || 'Search failed'
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  async function addJob(job: Job) {
    const tempId = generateTempId()
    const optimisticJob: Job = { 
      ...job, 
      id: tempId, 
      _id: tempId, 
      isPending: true, 
      tempId 
    }

    if (currentPage.value === 1) {
      jobs.value.unshift(optimisticJob)
      if (jobs.value.length > pageSize) {
        jobs.value.pop()
      }
    }
    totalItems.value++

    try {
      const headers = await getAuthHeaders()
      const postData = prepareJobDataForBackend(job)
      delete postData.isPending
      delete postData.id
      delete postData._id
      delete postData.tempId

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/jobs`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(postData)
        }
      )

      if (!response.ok) throw new Error('Failed to sync job')

      const data = await response.json()

      const jobIndex = jobs.value.findIndex(j => j.id === tempId)
      if (jobIndex !== -1) {
        jobs.value[jobIndex] = { ...data, isPending: false }
      }

      // ✅ Optimistic stats update (no need to fetch from DB)
      const statsStore = useStatsStore()
      statsStore.incrementJobAdded(
        job.status || 'applied',
        job.applicationPlatforms || [],
        job.dateApplied
      )

    } catch (err) {
      pendingJobs.value.push(optimisticJob)
    }
  }

  async function updateJob(id: string, data: Partial<Job>) {
    const jobIndex = jobs.value.findIndex(j => (j._id || j.id) === id)
    if (jobIndex === -1) return

    const currentJob = jobs.value[jobIndex]
    if (!currentJob) return

    const oldStatus = currentJob.status
    jobs.value[jobIndex] = { ...currentJob, ...data, isPending: true }

    const serverId = (currentJob._id || id) as string
    const tempId = (currentJob.id || id) as string

    if (!serverId.startsWith('temp-')) {
      try {
        const headers = await getAuthHeaders()
        const updateData = prepareJobDataForBackend({ id: serverId, ...data })

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/jobs`,
          {
            method: 'PATCH',
            headers,
            body: JSON.stringify(updateData)
          }
        )

        if (!response.ok) throw new Error('Failed to update job')

        if (jobs.value[jobIndex]) {
          jobs.value[jobIndex]!.isPending = false
        }

        pendingUpdates.value = pendingUpdates.value.filter(u => u.tempId !== tempId)

        // ✅ Optimistic stats update (only if status changed)
        if (data.status && data.status !== oldStatus) {
          const statsStore = useStatsStore()
          statsStore.updateJobStatus(oldStatus || 'applied', data.status)
        }

        // ✅ Optimistic platform update (if platforms changed)
        if (data.applicationPlatforms && currentJob.applicationPlatforms) {
          const statsStore = useStatsStore()
          statsStore.updateJobPlatforms(
            currentJob.applicationPlatforms,
            data.applicationPlatforms
          )
        }

      } catch (err) {
        const existingIndex = pendingUpdates.value.findIndex(u => u.tempId === tempId)
        if (existingIndex !== -1 && pendingUpdates.value[existingIndex]) {
          pendingUpdates.value[existingIndex]!.data = {
            ...pendingUpdates.value[existingIndex]!.data,
            ...data
          }
        } else {
          pendingUpdates.value.push({ id: serverId, tempId, data })
        }
      }
    } else {
      pendingUpdates.value.push({ id: serverId, tempId, data })
    }
  }

  async function deleteJob(id: string) {
    const job = jobs.value.find(j => (j._id || j.id) === id)
    if (!job) return

    const serverId = job._id
    const tempId = job.id || id
    const jobIndex = jobs.value.findIndex(j => (j._id || j.id) === id)

    pendingJobs.value = pendingJobs.value.filter(j => j.id !== tempId)
    pendingUpdates.value = pendingUpdates.value.filter(u => u.tempId !== tempId)

    if (jobIndex !== -1) {
      jobs.value.splice(jobIndex, 1)
    }
    totalItems.value--

    if (serverId && !serverId.startsWith('temp-')) {
      try {
        const headers = await getAuthHeaders()

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/jobs`,
          {
            method: 'DELETE',
            headers,
            body: JSON.stringify({ id: serverId })
          }
        )

        if (!response.ok) throw new Error('Failed to delete job')

        // ✅ Optimistic stats update (no need to fetch from DB)
        const statsStore = useStatsStore()
        statsStore.decrementJobDeleted(
          job.status || 'applied',
          job.applicationPlatforms || [],
          job.dateApplied
        )

      } catch (err) {
        pendingDeletes.value.push({ id: serverId })
      }
    }
  }

  async function syncChanges() {
    const headers = await getAuthHeaders()
    const idMap: Record<string, string> = {}

    for (const job of [...pendingJobs.value]) {
      if (!job.id) continue
      
      const tempId = job.id
      const postData = prepareJobDataForBackend(job)
      delete postData.isPending
      delete postData.id
      delete postData._id
      delete postData.tempId

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/jobs`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify(postData)
          }
        )

        if (!response.ok) throw new Error('Failed to sync job')

        const data = await response.json()
        idMap[tempId] = data._id
        pendingJobs.value = pendingJobs.value.filter(j => j.id !== tempId)

        const jobIndex = jobs.value.findIndex(j => j.id === tempId)
        if (jobIndex !== -1 && jobs.value[jobIndex]) {
          jobs.value[jobIndex] = { ...data, isPending: false }
        }
      } catch (err) {
      }
    }

    pendingUpdates.value = pendingUpdates.value.map(update => {
      if (idMap[update.tempId]) {
        return { ...update, id: idMap[update.tempId] as string }
      }
      return update
    })

    for (const update of [...pendingUpdates.value]) {
      if (update.id.startsWith('temp-')) continue

      try {
        const updateData = prepareJobDataForBackend({ id: update.id, ...update.data })

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/jobs`,
          {
            method: 'PATCH',
            headers,
            body: JSON.stringify(updateData)
          }
        )

        if (!response.ok) throw new Error('Failed to update job')

        pendingUpdates.value = pendingUpdates.value.filter(u => u.tempId !== update.tempId)

        const job = jobs.value.find(j => (j._id || j.id) === update.id)
        if (job) job.isPending = false
      } catch (err) {
      }
    }

    for (const deletion of [...pendingDeletes.value]) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/jobs`,
          {
            method: 'DELETE',
            headers,
            body: JSON.stringify({ id: deletion.id })
          }
        )

        if (!response.ok) throw new Error('Failed to delete job')

        pendingDeletes.value = pendingDeletes.value.filter(d => d.id !== deletion.id)
      } catch (err) {
      }
    }

    // Force refresh after sync
    if (activeSearchParams.value) {
      await searchJobs(activeSearchParams.value)
    } else {
      await fetchJobs(currentPage.value, true)
    }

    // ✅ Invalidate stats to force refresh from DB on next fetch
    // (Only after sync, to ensure client and server are in sync)
    const statsStore = useStatsStore()
    statsStore.invalidateStats()
    await statsStore.fetchStats(true) // Force one refresh after sync
  }

  async function exportJobs(format: ExportFormat) {
    try {
      const headers = await getAuthHeaders()
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/exportJobsData?format=${format}`,
        { headers }
      )

      if (!response.ok) {
        throw new Error('Failed to export jobs')
      }

      const contentDisposition = response.headers.get('Content-Disposition')
      const filenameParts = contentDisposition?.split('filename=')
      const filename = filenameParts && filenameParts[1]
        ? filenameParts[1].replace(/"/g, '')
        : `job_applications_${new Date().toISOString().split('T')[0]}.${format}`

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      return { success: true, message: 'Jobs exported successfully!' }
    } catch (err: any) {
      return { success: false, message: err.message }
    }
  }

  return {
    jobs,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    isLoading,
    connectionStatus,
    errorMessage,
    hasPendingChanges,
    pendingCount,
    hasLoadedInitially,
    activeSearchParams,
    fetchJobs,
    searchJobs,
    addJob,
    updateJob,
    deleteJob,
    syncChanges,
    exportJobs
  }
})