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