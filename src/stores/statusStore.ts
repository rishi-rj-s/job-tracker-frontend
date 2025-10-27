import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Status } from '../types'
import { supabase } from '../lib/supabase'

export const useStatusStore = defineStore('status', () => {
  const statuses = ref<Record<string, string>>({
    'Applied': 'Applied',
    'Screening': 'Screening/Review',
    'Interview': 'Interview Scheduled',
    'Offer': 'Offer Received',
    'Rejected': 'Rejected',
    'Closed': 'No Follow-up Required'
  })

  const pendingStatuses = ref<Status[]>([])

  const fixedStatuses = ['Applied', 'Screening', 'Interview', 'Offer', 'Rejected', 'Closed']

  async function fetchStatuses() {
    try {
      const { data, error } = await supabase.functions.invoke('statuses', {
        method: 'GET'
      })

      if (error) throw error

      if (data) {
        data.forEach((s: Status) => {
          statuses.value[s.key] = s.name
        })
      }
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