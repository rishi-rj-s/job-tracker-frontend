import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Status } from '../types'
import { supabase } from '../lib/supabase'

export const useStatusStore = defineStore('status', () => {
  const statuses = ref<Record>({
    'Applied': 'Applied',
    'Screening': 'Screening/Review',
    'Interview': 'Interview Scheduled',
    'Offer': 'Offer Received',
    'Rejected': 'Rejected',
    'Closed': 'No Follow-up Required'
  })

  const pendingStatuses = ref([])

  const fixedStatuses = ['Applied', 'Screening', 'Interview', 'Offer', 'Rejected', 'Closed']

  async function fetchStatuses() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/statuses`,
        {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) throw new Error('Failed to fetch statuses')

      const data = await response.json()

      // Clear and rebuild statuses
      statuses.value = {}
      data.forEach((s: Status) => {
        statuses.value[s.key] = s.name
      })
    } catch (err) {
      console.error('Error fetching statuses:', err)
    }
  }

  function addStatus(key: string, name: string) {
    statuses.value[key] = name
    pendingStatuses.value.push({ key, name })
  }

  function deleteStatus(key: string) {
    if (fixedStatuses.includes(key)) return false
    delete statuses.value[key]
    return true
  }

  function createStatusKey(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  return {
    statuses,
    pendingStatuses,
    fixedStatuses,
    fetchStatuses,
    addStatus,
    deleteStatus,
    createStatusKey
  }
})
