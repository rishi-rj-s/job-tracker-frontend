import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as XLSX from 'https://esm.sh/xlsx@0.18.5'
import { PDFDocument, StandardFonts, rgb } from 'https://esm.sh/pdf-lib@1.17.1'

export type ExportFormat = 'csv' | 'xlsx' | 'pdf' | 'json'

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  // Add your production domain here when deploying:
  'https://apply-log.site/',
  'https://www.apply-log.site/'
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
  if (!authHeader) throw new Error('Missing authorization header')
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabaseClient.auth.getUser(token)
  if (error || !user) throw new Error('Unauthorized')
  return user
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toISOString().split('T')[0]
  } catch {
    return ''
  }
}

function escapeCSV(value: any): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  return (str.includes(',') || str.includes('"') || str.includes('\n'))
    ? `"${str.replace(/"/g, '""')}"`
    : str
}

function transformJob(job: any) {
  return {
    'Job Title': job.job_title || '',
    'Company Name': job.company || '',
    'Date Applied': formatDate(job.date_applied),
    'Status': job.status || '',
    'Job Link (URL)': job.job_link || '',
    'Salary/Compensation': job.salary || '',
    'Location': job.location || '',
    'Next Action Date': formatDate(job.next_action_date),
    'Application Platforms': job.application_platforms?.join('; ') || ''
  }
}

// ---------------- CSV ----------------
function generateCSV(jobs: any[]): string {
  const headers = [
    'Job Title',
    'Company Name',
    'Date Applied',
    'Status',
    'Job Link (URL)',
    'Salary/Compensation',
    'Location',
    'Next Action Date',
    'Application Platforms'
  ]

  let csv = headers.join(',') + '\n'
  for (const job of jobs.map(transformJob)) {
    const row = headers.map(h => escapeCSV(job[h]))
    csv += row.join(',') + '\n'
  }
  return csv
}

// ---------------- JSON ----------------
function generateJSON(jobs: any[]): string {
  const formatted = jobs.map(transformJob)
  return JSON.stringify(formatted, null, 2)
}

// ---------------- XLSX ----------------
async function generateXLSX(jobs: any[]): Promise<Uint8Array> {
  const worksheet = XLSX.utils.json_to_sheet(jobs.map(transformJob))
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Job Applications')
  const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
  return new Uint8Array(buffer)
}

// ---------------- PDF ----------------
async function generatePDF(jobs: any[]): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([600, 800])
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontSize = 10
  const lineHeight = 14

  let y = 780
  page.drawText('Job Applications Export', { x: 40, y, size: 14, font })
  y -= 25

  const headers = [
    'Job Title', 'Company Name', 'Date Applied', 'Status', 'Job Link (URL)',
    'Salary/Compensation', 'Location', 'Next Action Date', 'Application Platforms'
  ]

  for (const job of jobs.map(transformJob)) {
    for (const header of headers) {
      const text = `${header}: ${job[header] || ''}`
      page.drawText(text.slice(0, 90), { x: 40, y, size: fontSize, font, color: rgb(0, 0, 0) })
      y -= lineHeight
      if (y < 40) {
        y = 780
        page = pdfDoc.addPage([600, 800])
      }
    }
    y -= 10
  }

  return await pdfDoc.save()
}

// ---------------- MAIN HANDLER ----------------
serve(async (req) => {
  const origin = req.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('authorization')
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader ?? '' } } }
    )
    const user = await getAuthenticatedUser(supabaseClient, authHeader)

    const url = new URL(req.url)
    const formatParam = url.searchParams.get('format') || 'csv'
    const format = formatParam.toLowerCase().trim() as ExportFormat

    if (!['csv', 'json', 'xlsx', 'pdf'].includes(format)) {
      return new Response(JSON.stringify({
        error: `Invalid format "${format}". Supported: csv, json, xlsx, pdf`
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { data: jobs, error } = await supabaseClient
      .from('jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('date_applied', { ascending: false })

    if (error) throw error
    if (!jobs || jobs.length === 0) {
      return new Response(JSON.stringify({ message: 'No jobs found to export.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const timestamp = new Date().toISOString().split('T')[0]
    let content: string | Uint8Array
    let contentType: string
    let filename: string

    if (format === 'csv') {
      content = generateCSV(jobs)
      contentType = 'text/csv; charset=utf-8'
      filename = `job_applications_${timestamp}.csv`
    } else if (format === 'json') {
      content = generateJSON(jobs)
      contentType = 'application/json; charset=utf-8'
      filename = `job_applications_${timestamp}.json`
    } else if (format === 'xlsx') {
      content = await generateXLSX(jobs)
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      filename = `job_applications_${timestamp}.xlsx`
    } else {
      content = await generatePDF(jobs)
      contentType = 'application/pdf'
      filename = `job_applications_${timestamp}.pdf`
    }

    return new Response(content, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      }
    })
  } catch (error) {
    const status = (error.message?.includes('auth')) ? 401 : 400
    return new Response(JSON.stringify({
      error: error.message || 'Export failed',
    }), {
      status,
      headers: { ...getCorsHeaders(req.headers.get('origin')), 'Content-Type': 'application/json' }
    })
  }
})