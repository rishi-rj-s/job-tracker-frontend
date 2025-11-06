import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS configuration - UPDATE THESE WITH YOUR ACTUAL DOMAINS BEFORE DEPLOYING
const allowedOrigins = [
  'http://localhost:5173', // Development
  'http://localhost:4173',  // Alternative dev port
  // Add your production domain here when deploying:
  // 'https://yourdomain.com',
  // 'https://www.yourdomain.com'
]

function getCorsHeaders(origin: string | null) {
  const isAllowed = origin && allowedOrigins.includes(origin)
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  }
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

    if (req.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const url = new URL(req.url)

    // Parse query parameters
    const query = url.searchParams.get('q') || '' // Company name search
    const status = url.searchParams.get('status') || '' // Filter by status
    const platform = url.searchParams.get('platform') || '' // Filter by platform
    const dateFrom = url.searchParams.get('dateFrom') || '' // Date range start
    const dateTo = url.searchParams.get('dateTo') || '' // Date range end
    const sortBy = url.searchParams.get('sortBy') || 'date_applied' // Sort field
    const sortOrder = url.searchParams.get('sortOrder') || 'desc' // Sort order (asc/desc)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100)
    const offset = (page - 1) * limit

    // Start building query
    let queryBuilder = supabaseClient
      .from('jobs')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)

    // MAIN SEARCH: Only search by company name
    if (query.trim()) {
      const searchQuery = query.trim()
      queryBuilder = queryBuilder.ilike('company', `%${searchQuery}%`)
    }

    // FILTERS: Apply additional filters independently

    // Filter by status
    if (status) {
      queryBuilder = queryBuilder.eq('status', status)
    }

    // Filter by date range
    if (dateFrom) {
      queryBuilder = queryBuilder.gte('date_applied', dateFrom)
    }
    if (dateTo) {
      queryBuilder = queryBuilder.lte('date_applied', dateTo)
    }

    // Filter by platform (contains)
    if (platform) {
      queryBuilder = queryBuilder.contains('application_platforms', [platform])
    }

    // Validate sort fields
    const validSortFields = ['date_applied', 'company', 'job_title', 'status', 'created_at', 'updated_at']
    const validSortOrders = ['asc', 'desc']

    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'date_applied'
    const finalSortOrder = validSortOrders.includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'desc'

    // Apply sorting
    queryBuilder = queryBuilder.order(finalSortBy, { ascending: finalSortOrder === 'asc' })

    // Apply pagination
    queryBuilder = queryBuilder.range(offset, offset + limit - 1)

    // Execute query
    const { data: jobs, error, count } = await queryBuilder

    if (error) throw error

    const totalPages = Math.ceil((count || 0) / limit)

    // Format response with camelCase
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
      },
      filters: {
        query: query || null,
        status: status || null,
        platform: platform || null,
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
        sortBy: finalSortBy,
        sortOrder: finalSortOrder
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Search Error:', error)

    let status = 400
    if (error.message === 'Unauthorized' || error.message.includes('authorization')) {
      status = 401
    }

    return new Response(JSON.stringify({
      error: error.message || 'An error occurred during search'
    }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})