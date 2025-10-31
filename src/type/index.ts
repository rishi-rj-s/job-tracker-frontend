export interface Job {
  id?: string
  _id?: string
  jobTitle: string
  company: string
  dateApplied: string
  jobLink?: string
  salary?: string
  location?: string
  status: string
  nextActionDate?: string
  notes?: string
  applicationPlatforms: string[]
  isPending?: boolean
  tempId?: string
}

export interface Status {
  key: string
  name: string
}

export interface Platform {
  key: string
  name: string
}

export interface PendingSync {
  jobs: Job[]
  updates: { id: string; tempId: string; data: Partial<Job> }[]
  deletes: { id: string }[]
}

// Export format types
export type ExportFormat = 'csv' | 'xlsx' | 'pdf' | 'json'

// API Response types
export interface ExportResponse {
  success: boolean
  message?: string
}

export interface AuthResponse {
  success: boolean
  message: string
  autoLogin?: boolean
  requiresVerification?: boolean
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
}

export interface JobsResponse {
  jobs: Job[]
  pagination: PaginationInfo
}