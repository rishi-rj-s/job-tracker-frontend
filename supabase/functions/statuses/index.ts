import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const allowedOrigins = [
  'http://localhost:5173', // Development
  'http://localhost:4173',  // Alternative dev port
  // Add your production domain here when deploying:
  'https://apply-log-henna.vercel.app'
]

function getCorsHeaders(origin: string | null) {
  const isAllowed = origin && allowedOrigins.includes(origin)
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS', // ← ADD THIS LINE!
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  }
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

    // THE FIX: Pass user's JWT to Supabase client
    // This makes auth.uid() work in RLS policies!
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader, // ← CRITICAL LINE!
          },
        },
      }
    )

    // Verify user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const url = new URL(req.url)
    const pathname = url.pathname

    // GET /statuses/defaults
    if (req.method === 'GET' && pathname.endsWith('/defaults')) {
      const { data, error } = await supabaseClient
        .from('default_statuses')
        .select('key, name')
        .order('name')

      if (error) throw error
      return new Response(JSON.stringify(data || []), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // GET /statuses/custom
    if (req.method === 'GET' && pathname.endsWith('/custom')) {
      const { data, error } = await supabaseClient
        .from('user_statuses')
        .select('key, name')
        .eq('user_id', user.id)
        .order('name')

      if (error) throw error
      return new Response(JSON.stringify(data || []), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // GET /statuses (all merged)
    if (req.method === 'GET') {
      const { data: defaults } = await supabaseClient
        .from('default_statuses')
        .select('key, name')
        .order('name')

      const { data: custom } = await supabaseClient
        .from('user_statuses')
        .select('key, name')
        .eq('user_id', user.id)
        .order('name')

      const all = [...(defaults || []), ...(custom || [])]
      const unique = Array.from(new Map(all.map(s => [s.key, s])).values())

      return new Response(JSON.stringify(unique), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // POST - Create custom status
    if (req.method === 'POST') {
      const body = await req.json()

      if (!body.key || !body.name) {
        throw new Error('Key and name are required')
      }

      const key = body.key.toLowerCase().trim().replace(/\s+/g, '-')
      const name = body.name.trim()

      // Check if default exists
      const { data: existing } = await supabaseClient
        .from('default_statuses')
        .select('key')
        .eq('key', key)
        .single()

      if (existing) {
        throw new Error('Cannot override default status')
      }

      // Insert (RLS will check user_id automatically!)
      const { data, error } = await supabaseClient
        .from('user_statuses')
        .insert({
          user_id: user.id,
          key: key,
          name: name
        })
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({
        key: data.key,
        name: data.name,
        message: 'Status created successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      })
    }

    // DELETE - Remove custom status
    if (req.method === 'DELETE') {
      const body = await req.json()

      if (!body.key) {
        throw new Error('Key is required')
      }

      // Check if default
      const { data: isDefault } = await supabaseClient
        .from('default_statuses')
        .select('key')
        .eq('key', body.key)
        .single()

      if (isDefault) {
        throw new Error('Cannot delete default status')
      }

      // Delete (RLS will check user_id automatically!)
      const { error } = await supabaseClient
        .from('user_statuses')
        .delete()
        .eq('user_id', user.id)
        .eq('key', body.key)

      if (error) throw error

      return new Response(JSON.stringify({ 
        success: true,
        message: 'Status deleted successfully' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error:', error)
    
    const status = error.message === 'Unauthorized' ? 401 : 400
    
    return new Response(JSON.stringify({ error: error.message }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})