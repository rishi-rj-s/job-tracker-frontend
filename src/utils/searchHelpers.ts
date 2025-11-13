export function createDebounce() {
  let timeout: ReturnType<typeof setTimeout>
  
  return (callback: () => void, wait: number = 800) => {
    clearTimeout(timeout)
    timeout = setTimeout(callback, wait)
  }
}

export function formatFilterName(filterName: string): string {
  const nameMap: Record<string, string> = {
    query: 'Company',
    status: 'Status',
    platform: 'Platform',
    dateFrom: 'From',
    dateTo: 'To',
    sortBy: 'Sort By',
    sortOrder: 'Sort Order'
  }
  
  return nameMap[filterName] || filterName
}

export function formatFilterValue(
  filterName: string,
  value: string,
  lookupMap?: Record<string, string>
): string {
  // For status/platform, use lookup map if provided
  if ((filterName === 'status' || filterName === 'platform') && lookupMap) {
    return lookupMap[value] || value
  }
  
  // For dates, format nicely
  if ((filterName === 'dateFrom' || filterName === 'dateTo') && value) {
    try {
      return new Date(value).toLocaleDateString()
    } catch {
      return value
    }
  }
  
  // For sort fields, format nicely
  if (filterName === 'sortBy') {
    const sortByMap: Record<string, string> = {
      date_applied: 'Date Applied',
      company: 'Company',
      job_title: 'Job Title',
      status: 'Status',
      created_at: 'Date Created'
    }
    return sortByMap[value] || value
  }
  
  if (filterName === 'sortOrder') {
    return value === 'asc' ? 'Oldest First' : 'Newest First'
  }
  
  return value
}

export function validateSearchParams(params: Record<string, any>): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // Validate dates
  if (params.dateFrom && params.dateTo) {
    const from = new Date(params.dateFrom)
    const to = new Date(params.dateTo)
    
    if (from > to) {
      errors.push('Start date must be before end date')
    }
  }
  
  // Validate query length
  if (params.query && params.query.length > 100) {
    errors.push('Search query must be 100 characters or less')
  }
  
  // Validate sort fields
  const validSortFields = ['date_applied', 'company', 'job_title', 'status', 'created_at']
  if (params.sortBy && !validSortFields.includes(params.sortBy)) {
    errors.push('Invalid sort field')
  }
  
  const validSortOrders = ['asc', 'desc']
  if (params.sortOrder && !validSortOrders.includes(params.sortOrder)) {
    errors.push('Invalid sort order')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function buildQueryString(params: Record<string, any>): string {
  const queryParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      queryParams.append(key, String(value))
    }
  })
  
  return queryParams.toString()
}

export function isEmptySearchParams(params: Record<string, any>): boolean {
  return Object.values(params).every(value => 
    value === null || value === undefined || value === ''
  )
}