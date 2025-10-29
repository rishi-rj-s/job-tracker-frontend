import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Job } from '../types'
import { supabase } from '../lib/supabase'

export const useJobStore = defineStore('job', () => {
  const jobs = ref<Job[]>([])
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalItems = ref(0)
  const pageSize = 20
  const isLoading = ref(false)
  const connectionStatus = ref<'loading' | 'success' | 'error'>('loading')
  const errorMessage = ref('')

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

  // Get auth headers
  async function getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession()
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token || ''}`
    }
  }

  async function fetchJobs(page = 1) {
    isLoading.value = true
    connectionStatus.value = 'loading'

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

    } catch (err: any) {
      console.error('Error fetching jobs:', err)
      connectionStatus.value = 'error'
      errorMessage.value = err.message || 'Connection failed'
    } finally {
      isLoading.value = false
    }
  }

  function addJob(job: Job) {
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

    pendingJobs.value.push(optimisticJob)
    totalItems.value++
  }

  function updateJob(id: string, data: Partial<Job>) {
    const jobIndex = jobs.value.findIndex(j => (j._id || j.id) === id)
    if (jobIndex === -1) return

    jobs.value[jobIndex] = { ...jobs.value[jobIndex], ...data, isPending: true }

    const serverId = (jobs.value[jobIndex]._id || id) as string
    const tempId = (jobs.value[jobIndex].id || id) as string

    const existingIndex = pendingUpdates.value.findIndex(u => u.tempId === tempId)

    if (existingIndex !== -1) {
      pendingUpdates.value[existingIndex].data = {
        ...pendingUpdates.value[existingIndex].data,
        ...data
      }
    } else {
      pendingUpdates.value.push({ id: serverId, tempId, data })
    }
  }

  function deleteJob(id: string) {
    const job = jobs.value.find(j => (j._id || j.id) === id)
    if (!job) return

    const serverId = job._id
    const tempId = job.id || id
    const jobIndex = jobs.value.findIndex(j => (j._id || j.id) === id)

    pendingJobs.value = pendingJobs.value.filter(j => j.id !== tempId)
    pendingUpdates.value = pendingUpdates.value.filter(u => u.tempId !== tempId)

    if (serverId && !serverId.startsWith('temp-')) {
      pendingDeletes.value.push({ id: serverId })
    }

    jobs.value.splice(jobIndex, 1)
    totalItems.value--
  }

  async function syncChanges() {
    const headers = await getAuthHeaders()
    const idMap: Record<string, string> = {}

    // Sync new jobs (POST)
    for (const job of [...pendingJobs.value]) {
      const tempId = job.id!
      const postData: Partial<Job> = { ...job }
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
        if (jobIndex !== -1) {
          jobs.value[jobIndex] = { ...data, isPending: false }
        }
      } catch (err) {
        console.error('Failed to sync job POST:', err)
      }
    }

    // Update IDs in pending updates
    pendingUpdates.value = pendingUpdates.value.map(update => {
      if (idMap[update.tempId]) {
        return { ...update, id: idMap[update.tempId] as string }
      }
      return update
    })

    // Sync updates (PATCH)
    for (const update of [...pendingUpdates.value]) {
      if (update.id.startsWith('temp-')) continue

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/jobs`,
          {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ id: update.id, ...update.data })
          }
        )

        if (!response.ok) throw new Error('Failed to update job')

        pendingUpdates.value = pendingUpdates.value.filter(u => u.tempId !== update.tempId)

        const job = jobs.value.find(j => (j._id || j.id) === update.id)
        if (job) job.isPending = false
      } catch (err) {
        console.error('Failed to sync job PATCH:', err)
      }
    }

    // Sync deletes (DELETE)
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
        console.error('Failed to sync job DELETE:', err)
      }
    }
  }

  // Export jobs function
  async function exportJobs(format: 'csv' | 'json' = 'csv') {
    try {
      const headers = await getAuthHeaders()
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/export-jobs?format=${format}`,
        { headers }
      )

      if (!response.ok) {
        throw new Error('Failed to export jobs')
      }

      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
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
    fetchJobs,
    addJob,
    updateJob,
    deleteJob,
    syncChanges,
    exportJobs
  }
})