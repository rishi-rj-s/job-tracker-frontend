import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000'
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

function formatDateForExport(dateStr: string | null): string {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    return date.toISOString().split('T')[0] // YYYY-MM-DD format
  } catch {
    return ''
  }
}

function escapeCSV(value: any): string {
  if (value === null || value === undefined) return ''
  
  const str = String(value)
  
  // If contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  
  return str
}

function generateCSV(jobs: any[]): string {
  // CSV Headers
  const headers = [
    'Job Title',
    'Company',
    'Date Applied',
    'Status',
    'Location',
    'Salary',
    'Job Link',
    'Platforms',
    'Next Action Date',
    'Notes',
    'Created At',
    'Updated At'
  ]

  // Start with header row
  let csv = headers.join(',') + '\n'

  // Add data rows
  for (const job of jobs) {
    const row = [
      escapeCSV(job.job_title),
      escapeCSV(job.company),
      escapeCSV(formatDateForExport(job.date_applied)),
      escapeCSV(job.status),
      escapeCSV(job.location),
      escapeCSV(job.salary),
      escapeCSV(job.job_link),
      escapeCSV(job.application_platforms?.join('; ') || ''),
      escapeCSV(formatDateForExport(job.next_action_date)),
      escapeCSV(job.notes),
      escapeCSV(formatDateForExport(job.created_at)),
      escapeCSV(formatDateForExport(job.updated_at))
    ]
    
    csv += row.join(',') + '\n'
  }

  return csv
}

function generateJSON(jobs: any[]): string {
  // Transform to more readable format
  const formatted = jobs.map(job => ({
    jobTitle: job.job_title,
    company: job.company,
    dateApplied: formatDateForExport(job.date_applied),
    status: job.status,
    location: job.location,
    salary: job.salary,
    jobLink: job.job_link,
    platforms: job.application_platforms || [],
    nextActionDate: formatDateForExport(job.next_action_date),
    notes: job.notes,
    createdAt: job.created_at,
    updatedAt: job.updated_at
  }))

  return JSON.stringify(formatted, null, 2)
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

    console.log('📥 Export request received')
    console.log('Request URL:', req.url)
    
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
    console.log('✅ User authenticated:', user.id)

    if (req.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const url = new URL(req.url)
    const formatParam = url.searchParams.get('format') || 'csv'
    const format = formatParam.toLowerCase().trim()

    // Validate format
    if (!['csv', 'json'].includes(format)) {
      console.error('Invalid format received:', formatParam)
      throw new Error(`Invalid format "${formatParam}". Use "csv" or "json"`)
    }

    console.log(`✅ Export format validated: ${format}`)

    // Fetch all jobs for the user (no pagination for export)
    const { data: jobs, error } = await supabaseClient
      .from('jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('date_applied', { ascending: false })

    if (error) throw error

    if (!jobs || jobs.length === 0) {
      throw new Error('No jobs found to export')
    }

    console.log(`📦 Exporting ${jobs.length} jobs as ${format.toUpperCase()}`)

    let content: string
    let contentType: string
    let filename: string

    const timestamp = new Date().toISOString().split('T')[0]

    if (format === 'csv') {
      content = generateCSV(jobs)
      contentType = 'text/csv; charset=utf-8'
      filename = `job_applications_${timestamp}.csv`
    } else {
      content = generateJSON(jobs)
      contentType = 'application/json; charset=utf-8'
      filename = `job_applications_${timestamp}.json`
    }

    return new Response(content, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(new TextEncoder().encode(content).length)
      }
    })

  } catch (error) {
    console.error('Export Error:', error)

    let status = 400
    if (error.message === 'Unauthorized' || error.message.includes('authorization')) {
      status = 401
    }

    return new Response(JSON.stringify({
      error: error.message || 'An error occurred during export'
    }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})