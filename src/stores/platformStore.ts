import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Platform } from '../types'
import { supabase } from '../lib/supabase'

export const usePlatformStore = defineStore('platform', () => {
  const platforms = ref<Record<string, string>>({
    'linkedin': 'LinkedIn',
    'company-website': 'Company Website',
    'hr-email': 'HR Email',
    'whatsapp': 'WhatsApp',
    'recruiter': 'Recruiter Contact',
    'other': 'Other'
  })

  const pendingPlatforms = ref<Platform[]>([])

  const fixedPlatforms = ['linkedin', 'company-website', 'hr-email', 'whatsapp', 'recruiter', 'other']

  async function fetchPlatforms() {
    try {
      const { data, error } = await supabase.functions.invoke('platforms', {
        method: 'GET'
      })

      if (error) throw error

      if (data) {
        data.forEach((p: Platform) => {
          platforms.value[p.key] = p.name
        })
      }
    } catch (err) {
      console.error('Error fetching platforms:', err)
    }
  }

  function addPlatform(key: string, name: string) {
    platforms.value[key] = name
    pendingPlatforms.value.push({ key, name })
  }

  function deletePlatform(key: string) {
    if (fixedPlatforms.includes(key)) return false
    delete platforms.value[key]
    return true
  }

  function createPlatformKey(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  return {
    platforms,
    pendingPlatforms,
    fixedPlatforms,
    fetchPlatforms,
    addPlatform,
    deletePlatform,
    createPlatformKey
  }
})