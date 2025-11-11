import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'https://apply-log-henna.vercel.app'
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

    // Get total count
    const { count: totalCount } = await supabaseClient
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Get all jobs' status field for aggregation
    const { data: statusData, error: statusError } = await supabaseClient
      .from('jobs')
      .select('status')
      .eq('user_id', user.id)

    if (statusError) throw statusError

    // Aggregate counts by status (case-insensitive)
    const statusMap: Record<string, number> = {}
    
    if (statusData) {
      for (const job of statusData) {
        const status = (job.status || 'applied').toLowerCase()
        statusMap[status] = (statusMap[status] || 0) + 1
      }
    }

    // Get all jobs' platforms for aggregation
    const { data: platformData, error: platformError } = await supabaseClient
      .from('jobs')
      .select('application_platforms')
      .eq('user_id', user.id)

    if (platformError) throw platformError

    const platformMap: Record<string, number> = {}
    
    if (platformData) {
      for (const job of platformData) {
        if (Array.isArray(job.application_platforms)) {
          for (const platform of job.application_platforms) {
            platformMap[platform] = (platformMap[platform] || 0) + 1
          }
        }
      }
    }

    // Get applications in the last 7 days
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const { count: weekCount } = await supabaseClient
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('date_applied', oneWeekAgo.toISOString().split('T')[0])

    // Get applications in the last 30 days
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const { count: monthCount } = await supabaseClient
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('date_applied', oneMonthAgo.toISOString().split('T')[0])

    // Get count of jobs with upcoming action dates
    const { count: upcomingActionsCount } = await supabaseClient
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('next_action_date', now.toISOString().split('T')[0])

    // Sort platforms by count (top 5)
    const topPlatforms = Object.entries(platformMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key, count]) => ({ key, count }))

    return new Response(JSON.stringify({
      total: totalCount || 0,
      statusBreakdown: statusMap,
      platformBreakdown: platformMap,
      topPlatforms,
      thisWeek: weekCount || 0,
      thisMonth: monthCount || 0,
      upcomingActions: upcomingActionsCount || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Stats Error:', error)

    let status = 400
    if (error.message === 'Unauthorized' || error.message.includes('authorization')) {
      status = 401
    }

    return new Response(JSON.stringify({
      error: error.message || 'An error occurred while fetching statistics'
    }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})