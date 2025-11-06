import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  // Add your production domain here when deploying:
  'https://apply-log-henna.vercel.app'
]

function getCorsHeaders(origin: string | null) {
  const isAllowed = origin && allowedOrigins.includes(origin)
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  }
}

// Rate limiting cache
const rateLimitCache = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(userId: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now()
  const userLimit = rateLimitCache.get(userId)

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitCache.set(userId, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (userLimit.count >= maxRequests) {
    return false
  }

  userLimit.count++
  return true
}

async function getAuthenticatedUser(supabaseClient: any, authHeader: string | null) {
  if (!authHeader) {
    throw new Error('Missing authorization header')
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabaseClient.auth.getUser(token)

  if (error || !user) {
    throw new Error('Unauthorized')
  }

  return user
}

// BACKEND NORMALIZATION - Same logic as frontend
function normalizeToKey(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// NEW: Auto-save custom statuses and platforms with BOTH key and name
async function ensureCustomFieldsExist(
  supabaseClient: any,
  userId: string,
  statusData: { key?: string; name?: string } | undefined,
  platformsData: Array<{ key?: string; name?: string }>
) {

  // Get default statuses and platforms
  const { data: defaultStatuses } = await supabaseClient
    .from('default_statuses')
    .select('key')

  const { data: defaultPlatforms } = await supabaseClient
    .from('default_platforms')
    .select('key')

  const defaultStatusKeys = new Set((defaultStatuses || []).map((s: any) => s.key))
  const defaultPlatformKeys = new Set((defaultPlatforms || []).map((p: any) => p.key))

  // Handle status - use provided key/name or normalize from either
  if (statusData) {
    let statusKey = statusData.key
    let statusName = statusData.name

    // If only name provided, generate key
    if (!statusKey && statusName) {
      statusKey = normalizeToKey(statusName)
    }
    // If only key provided, use it as name too (fallback)
    if (!statusName && statusKey) {
      statusName = statusKey
    }

    if (statusKey && !defaultStatusKeys.has(statusKey)) {

      const { error } = await supabaseClient
        .from('user_statuses')
        .upsert({
          user_id: userId,
          key: statusKey,
          name: statusName
        }, { onConflict: 'user_id,key' })

      if (error && !error.message.includes('duplicate')) {
      } else {
      }
    }
  }

  // Handle platforms - use provided key/name or normalize from either
  for (const platformData of platformsData) {
    let platformKey = platformData.key
    let platformName = platformData.name

    // If only name provided, generate key
    if (!platformKey && platformName) {
      platformKey = normalizeToKey(platformName)
    }
    // If only key provided, use it as name too (fallback)
    if (!platformName && platformKey) {
      platformName = platformKey
    }

    if (platformKey && !defaultPlatformKeys.has(platformKey)) {

      const { error } = await supabaseClient
        .from('user_platforms')
        .upsert({
          user_id: userId,
          key: platformKey,
          name: platformName
        }, { onConflict: 'user_id,key' })

      if (error && !error.message.includes('duplicate')) {
      } else {
      }
    }
  }
}

function validateJobData(body: any) {
  const errors: string[] = []

  if (!body.jobTitle?.trim()) {
    errors.push('Job title is required')
  } else if (body.jobTitle.trim().length > 200) {
    errors.push('Job title must be 200 characters or less')
  }

  if (!body.company?.trim()) {
    errors.push('Company name is required')
  } else if (body.company.trim().length > 200) {
    errors.push('Company name must be 200 characters or less')
  }

  if (!body.dateApplied) {
    errors.push('Date applied is required')
  } else if (!isValidDate(body.dateApplied)) {
    errors.push('Invalid date format for date applied')
  }

  if (body.jobLink && !isValidUrl(body.jobLink)) {
    errors.push('Invalid job link URL')
  }

  if (body.salary && body.salary.length > 100) {
    errors.push('Salary must be 100 characters or less')
  }

  if (body.location && body.location.length > 200) {
    errors.push('Location must be 200 characters or less')
  }

  if (body.notes && body.notes.length > 5000) {
    errors.push('Notes must be 5000 characters or less')
  }

  if (!body.applicationPlatforms || !Array.isArray(body.applicationPlatforms) || body.applicationPlatforms.length === 0) {
    errors.push('At least one application platform is required')
  } else if (body.applicationPlatforms.length > 10) {
    errors.push('Maximum 10 application platforms allowed')
  }

  if (errors.length > 0) {
    throw new Error(errors.join(', '))
  }
}

function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

function isValidDate(dateStr: string): boolean {
  const date = new Date(dateStr)
  return date instanceof Date && !isNaN(date.getTime())
}

serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    )
    const user = await getAuthenticatedUser(supabaseClient, authHeader)

    // Rate limiting check
    if (!checkRateLimit(user.id)) {
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded. Please try again later.'
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const url = new URL(req.url)
    const isBulk = url.pathname.endsWith('/bulk')

    // GET - Fetch user's jobs with pagination
    if (req.method === 'GET') {
      const page = parseInt(url.searchParams.get('page') || '1')
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100)
      const offset = (page - 1) * limit

      const { data: jobs, error, count } = await supabaseClient
        .from('jobs')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('date_applied', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      const totalPages = Math.ceil((count || 0) / limit)

      const formattedJobs = (jobs || []).map((job: any) => ({
        _id: job.id,
        jobTitle: job.job_title,
        company: job.company,
        dateApplied: job.date_applied,
        jobLink: job.job_link,
        salary: job.salary,
        location: job.location,
        status: job.status,
        nextActionDate: job.next_action_date,
        notes: job.notes,
        applicationPlatforms: job.application_platforms,
        createdAt: job.created_at,
        updatedAt: job.updated_at
      }))

      return new Response(JSON.stringify({
        jobs: formattedJobs,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: count || 0,
          pageSize: limit
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // POST - Create new job
    if (req.method === 'POST' && !isBulk) {
      const body = await req.json()

      // Validate input
      validateJobData(body)

      // NEW: Extract status and platform metadata
      const statusData = body.statusMetadata || { key: body.status, name: body.statusName }
      const platformsData = body.platformsMetadata || body.applicationPlatforms.map((key: string) => ({ key }))

      // Auto-save custom fields BEFORE creating job
      await ensureCustomFieldsExist(
        supabaseClient,
        user.id,
        statusData,
        platformsData
      )

      // Extract just the keys for database storage
      const statusKey = typeof body.status === 'string' ? body.status : body.status?.key || 'applied'
      const platformKeys = Array.isArray(body.applicationPlatforms) 
        ? body.applicationPlatforms.map((p: any) => typeof p === 'string' ? p : p.key)
        : []

      const jobData = {
        user_id: user.id,
        job_title: body.jobTitle.trim(),
        company: body.company.trim(),
        date_applied: body.dateApplied,
        job_link: body.jobLink?.trim() || null,
        salary: body.salary?.trim() || null,
        location: body.location?.trim() || null,
        status: statusKey,
        next_action_date: body.nextActionDate || null,
        notes: body.notes?.trim() || null,
        application_platforms: platformKeys
      }

      const { data, error } = await supabaseClient
        .from('jobs')
        .insert([jobData])
        .select()
        .single()

      if (error) throw error

      const formattedData = {
        _id: data.id,
        jobTitle: data.job_title,
        company: data.company,
        dateApplied: data.date_applied,
        jobLink: data.job_link,
        salary: data.salary,
        location: data.location,
        status: data.status,
        nextActionDate: data.next_action_date,
        notes: data.notes,
        applicationPlatforms: data.application_platforms,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      return new Response(JSON.stringify(formattedData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      })
    }

    // PATCH - Update job
    if (req.method === 'PATCH') {
      const body = await req.json()
      const { id, ...updates } = body

      if (!id) {
        throw new Error('Job ID is required')
      }

      // NEW: Extract status and platform metadata if provided
      if (updates.status || updates.applicationPlatforms) {
        const statusData = updates.statusMetadata || { key: updates.status, name: updates.statusName }
        const platformsData = updates.platformsMetadata || (updates.applicationPlatforms || []).map((key: string) => ({ key }))
        
        await ensureCustomFieldsExist(
          supabaseClient,
          user.id,
          statusData,
          platformsData
        )
      }

      // Build update object with validation
      const updateData: any = {}

      if (updates.jobTitle !== undefined) {
        if (!updates.jobTitle.trim()) throw new Error('Job title cannot be empty')
        if (updates.jobTitle.trim().length > 200) throw new Error('Job title must be 200 characters or less')
        updateData.job_title = updates.jobTitle.trim()
      }

      if (updates.company !== undefined) {
        if (!updates.company.trim()) throw new Error('Company name cannot be empty')
        if (updates.company.trim().length > 200) throw new Error('Company name must be 200 characters or less')
        updateData.company = updates.company.trim()
      }

      if (updates.dateApplied !== undefined) {
        if (!isValidDate(updates.dateApplied)) throw new Error('Invalid date format')
        updateData.date_applied = updates.dateApplied
      }

      if (updates.jobLink !== undefined) {
        if (updates.jobLink && !isValidUrl(updates.jobLink)) throw new Error('Invalid job link URL')
        updateData.job_link = updates.jobLink?.trim() || null
      }

      if (updates.salary !== undefined) {
        if (updates.salary && updates.salary.length > 100) throw new Error('Salary must be 100 characters or less')
        updateData.salary = updates.salary?.trim() || null
      }

      if (updates.location !== undefined) {
        if (updates.location && updates.location.length > 200) throw new Error('Location must be 200 characters or less')
        updateData.location = updates.location?.trim() || null
      }

      if (updates.status !== undefined) {
        const statusKey = typeof updates.status === 'string' ? updates.status : updates.status?.key
        updateData.status = statusKey
      }

      if (updates.nextActionDate !== undefined) {
        updateData.next_action_date = updates.nextActionDate || null
      }

      if (updates.notes !== undefined) {
        if (updates.notes && updates.notes.length > 5000) throw new Error('Notes must be 5000 characters or less')
        updateData.notes = updates.notes?.trim() || null
      }

      if (updates.applicationPlatforms !== undefined) {
        const platformKeys = Array.isArray(updates.applicationPlatforms)
          ? updates.applicationPlatforms.map((p: any) => typeof p === 'string' ? p : p.key)
          : []
        
        if (platformKeys.length === 0) {
          throw new Error('At least one application platform is required')
        }
        if (platformKeys.length > 10) throw new Error('Maximum 10 application platforms allowed')
        updateData.application_platforms = platformKeys
      }

      const { data, error } = await supabaseClient
        .from('jobs')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      if (!data) {
        return new Response(JSON.stringify({ error: 'Job not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const formattedData = {
        _id: data.id,
        jobTitle: data.job_title,
        company: data.company,
        dateApplied: data.date_applied,
        jobLink: data.job_link,
        salary: data.salary,
        location: data.location,
        status: data.status,
        nextActionDate: data.next_action_date,
        notes: data.notes,
        applicationPlatforms: data.application_platforms,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      return new Response(JSON.stringify(formattedData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // DELETE - Delete job
    if (req.method === 'DELETE') {
      const body = await req.json()
      const { id } = body

      if (!id) throw new Error('Job ID is required')

      const { data: existingJob } = await supabaseClient
        .from('jobs')
        .select('id')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (!existingJob) {
        return new Response(JSON.stringify({ error: 'Job not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { error } = await supabaseClient
        .from('jobs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      return new Response(JSON.stringify({
        success: true,
        message: 'Job deleted successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {

    let status = 400
    if (error.message === 'Unauthorized' || error.message.includes('authorization')) {
      status = 401
    }

    return new Response(JSON.stringify({
      error: error.message || 'An error occurred'
    }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})