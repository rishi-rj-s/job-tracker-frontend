import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useJobStore } from '@/stores/jobStore'

export interface SearchParams {
  query: string
  status: string
  platform: string
  dateFrom: string
  dateTo: string
  sortBy: string
  sortOrder: string
}

const DEFAULT_SEARCH_PARAMS: SearchParams = {
  query: '',
  status: '',
  platform: '',
  dateFrom: '',
  dateTo: '',
  sortBy: 'date_applied',
  sortOrder: 'desc'
}

/**
 * Composable for managing search state with URL persistence
 * Handles:
 * - Search parameter state management
 * - URL synchronization
 * - Browser navigation (back/forward)
 * - Deep linking support
 */
export function useSearchState() {
  const route = useRoute()
  const router = useRouter()
  const jobStore = useJobStore()

  const searchParams = ref<SearchParams>({ ...DEFAULT_SEARCH_PARAMS })
  const isSearching = ref(false)

  // Computed properties
  const hasActiveFilters = computed(() => {
    return !!(
      searchParams.value.query ||
      searchParams.value.status ||
      searchParams.value.platform ||
      searchParams.value.dateFrom ||
      searchParams.value.dateTo
    )
  })

  const isUsingNonDefaultSort = computed(() => {
    return searchParams.value.sortBy !== DEFAULT_SEARCH_PARAMS.sortBy ||
           searchParams.value.sortOrder !== DEFAULT_SEARCH_PARAMS.sortOrder
  })

  /**
   * Sync current search params to URL query parameters
   * Only non-empty/non-default values are included to keep URLs clean
   */
  const updateUrlParams = () => {
    const query: Record<string, string> = {}
    
    // Add non-empty filters
    if (searchParams.value.query) query.q = searchParams.value.query
    if (searchParams.value.status) query.status = searchParams.value.status
    if (searchParams.value.platform) query.platform = searchParams.value.platform
    if (searchParams.value.dateFrom) query.dateFrom = searchParams.value.dateFrom
    if (searchParams.value.dateTo) query.dateTo = searchParams.value.dateTo
    
    // Only add sort params if they differ from defaults
    if (searchParams.value.sortBy !== DEFAULT_SEARCH_PARAMS.sortBy) {
      query.sortBy = searchParams.value.sortBy
    }
    if (searchParams.value.sortOrder !== DEFAULT_SEARCH_PARAMS.sortOrder) {
      query.sortOrder = searchParams.value.sortOrder
    }
    
    // Only update if query params actually changed (prevents infinite loops)
    if (JSON.stringify(route.query) !== JSON.stringify(query)) {
      router.replace({ query })
    }
  }

  /**
   * Load search params from URL query parameters
   * Called on mount and when URL changes
   */
  const loadFromUrl = () => {
    const query = route.query
    
    searchParams.value = {
      query: (query.q as string) || '',
      status: (query.status as string) || '',
      platform: (query.platform as string) || '',
      dateFrom: (query.dateFrom as string) || '',
      dateTo: (query.dateTo as string) || '',
      sortBy: (query.sortBy as string) || DEFAULT_SEARCH_PARAMS.sortBy,
      sortOrder: (query.sortOrder as string) || DEFAULT_SEARCH_PARAMS.sortOrder
    }
  }

  /**
   * Execute search with current parameters
   * Updates URL and triggers appropriate store action
   */
  const executeSearch = async () => {
    // Sync to URL first
    updateUrlParams()
    
    // If no filters, fetch normally
    if (!hasActiveFilters.value) {
      jobStore.activeSearchParams = null
      await jobStore.fetchJobs(1, true)
      return
    }

    // Execute search with filters
    isSearching.value = true
    try {
      await jobStore.searchJobs(searchParams.value)
    } finally {
      isSearching.value = false
    }
  }

  /**
   * Clear a specific filter and trigger search
   */
  const clearFilter = async (filterName: keyof SearchParams) => {
    if (filterName === 'sortBy') {
      searchParams.value.sortBy = DEFAULT_SEARCH_PARAMS.sortBy
    } else if (filterName === 'sortOrder') {
      searchParams.value.sortOrder = DEFAULT_SEARCH_PARAMS.sortOrder
    } else {
      searchParams.value[filterName] = ''
    }
    await executeSearch()
  }

  /**
   * Clear all filters and reset to defaults
   */
  const clearAllFilters = async () => {
    searchParams.value = { ...DEFAULT_SEARCH_PARAMS }
    
    // Clear URL params
    router.replace({ query: {} })
    
    // Reset store state
    jobStore.activeSearchParams = null
    await jobStore.fetchJobs(1, true)
  }

  /**
   * Set a specific filter value
   */
  const setFilter = <K extends keyof SearchParams>(
    filterName: K,
    value: SearchParams[K]
  ) => {
    searchParams.value[filterName] = value
  }

  /**
   * Initialize search state from URL
   * Call this in onMounted
   */
  const initializeFromUrl = async () => {
    loadFromUrl()
    
    // If URL has search params, trigger search
    if (hasActiveFilters.value) {
      await executeSearch()
    }
  }

  /**
   * Watch for URL changes (browser back/forward)
   */
  const watchUrlChanges = () => {
    watch(() => route.query, () => {
      loadFromUrl()
      
      // Trigger appropriate action
      if (hasActiveFilters.value) {
        jobStore.searchJobs(searchParams.value)
      } else {
        jobStore.activeSearchParams = null
        jobStore.fetchJobs(1)
      }
    }, { deep: true })
  }

  return {
    // State
    searchParams,
    isSearching,
    
    // Computed
    hasActiveFilters,
    isUsingNonDefaultSort,
    
    // Methods
    executeSearch,
    clearFilter,
    clearAllFilters,
    setFilter,
    initializeFromUrl,
    watchUrlChanges,
    updateUrlParams,
    loadFromUrl
  }
}