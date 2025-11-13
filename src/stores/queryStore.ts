import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useQueryStore = defineStore('query', () => {
  const lastJobsQuery = ref<Record<string, string>>({})
  
  function saveJobsQuery(query: Record<string, string>) {
    lastJobsQuery.value = { ...query }
  }
  
  function clearJobsQuery() {
    lastJobsQuery.value = {}
  }
  
  function hasJobsQuery(): boolean {
    return Object.keys(lastJobsQuery.value).length > 0
  }
  
  return {
    lastJobsQuery,
    saveJobsQuery,
    clearJobsQuery,
    hasJobsQuery
  }
})