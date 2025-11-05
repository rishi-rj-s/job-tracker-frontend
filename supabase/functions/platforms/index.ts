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
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS', // ← ADD THIS LINE!
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

// Validation functions
function isValidPlatformKey(key: string): boolean {
  // Alphanumeric, hyphens, underscores only, 2-50 characters
  return /^[a-z0-9_-]{2,50}$/.test(key)
}

function isValidPlatformName(name: string): boolean {
  const trimmed = name.trim()
  return trimmed.length >= 2 && trimmed.length <= 100
}

function normalizePlatformKey(key: string): string {
  // Convert to lowercase and replace spaces with hyphens
  return key.toLowerCase().trim().replace(/\s+/g, '-')
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
    const url = new URL(req.url)
    const pathname = url.pathname

    // GET /platforms/defaults - Fetch default platforms (no auth required, but we'll still validate)
    if (req.method === 'GET' && pathname.endsWith('/defaults')) {
      const authHeader = req.headers.get('authorization')
      await getAuthenticatedUser(supabaseClient, authHeader) // Still validate user

      const { data: defaultPlatforms, error: defaultError } = await supabaseClient
        .from('default_platforms')
        .select('key, name')
        .order('name')

      if (defaultError) throw defaultError

      console.log(`📤 Returning ${defaultPlatforms?.length || 0} default platforms`)

      return new Response(JSON.stringify(defaultPlatforms || []), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // GET /platforms/custom - Fetch user-specific custom platforms
    if (req.method === 'GET' && pathname.endsWith('/custom')) {
      const authHeader = req.headers.get('authorization')
      const user = await getAuthenticatedUser(supabaseClient, authHeader)

      const { data: userPlatforms, error: userError } = await supabaseClient
        .from('user_platforms')
        .select('key, name')
        .eq('user_id', user.id)
        .order('name')

      if (userError) throw userError

      console.log(`📤 Returning ${userPlatforms?.length || 0} custom platforms for user ${user.id}`)

      return new Response(JSON.stringify(userPlatforms || []), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // GET /platforms - Fetch default + user-specific platforms (merged)
    // LEGACY ENDPOINT - kept for backward compatibility
    if (req.method === 'GET') {
      const authHeader = req.headers.get('authorization')
      const user = await getAuthenticatedUser(supabaseClient, authHeader)

      // Get default platforms
      const { data: defaultPlatforms, error: defaultError } = await supabaseClient
        .from('default_platforms')
        .select('key, name')
        .order('name')

      if (defaultError) throw defaultError

      // Get user-specific platforms
      const { data: userPlatforms, error: userError } = await supabaseClient
        .from('user_platforms')
        .select('key, name')
        .eq('user_id', user.id)
        .order('name')

      if (userError) throw userError

      // Merge both (user platforms override defaults if same key)
      const allPlatforms = [...(defaultPlatforms || []), ...(userPlatforms || [])]

      // Remove duplicates (user platforms take precedence)
      const uniquePlatforms = Array.from(
        new Map(allPlatforms.map(p => [p.key, p])).values()
      )

      return new Response(JSON.stringify(uniquePlatforms), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // POST - Create user-specific platform
    if (req.method === 'POST') {
      const authHeader = req.headers.get('authorization')
      const user = await getAuthenticatedUser(supabaseClient, authHeader)

      const body = await req.json()

      if (!body.key || !body.name) {
        throw new Error('Key and name are required')
      }

      // Normalize and validate key
      const normalizedKey = normalizePlatformKey(body.key)

      if (!isValidPlatformKey(normalizedKey)) {
        throw new Error('Invalid key format. Use lowercase letters, numbers, hyphens, and underscores only (2-50 characters)')
      }

      // Validate name
      if (!isValidPlatformName(body.name)) {
        throw new Error('Invalid name. Name must be between 2 and 100 characters')
      }

      const trimmedName = body.name.trim()

      // Check if it's a default platform
      const { data: existingDefault } = await supabaseClient
        .from('default_platforms')
        .select('key')
        .eq('key', normalizedKey)
        .single()

      if (existingDefault) {
        throw new Error('Cannot override default platform')
      }

      // Check if user already has a platform with this name
      const { data: existingByName } = await supabaseClient
        .from('user_platforms')
        .select('key')
        .eq('user_id', user.id)
        .eq('name', trimmedName)
        .single()

      if (existingByName) {
        throw new Error('A platform with this name already exists')
      }

      // Insert user-specific platform
      const { data, error } = await supabaseClient
        .from('user_platforms')
        .upsert([
          {
            user_id: user.id,
            key: normalizedKey,
            name: trimmedName
          }
        ], { onConflict: 'user_id,key' })
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({
        key: data.key,
        name: data.name,
        message: 'Platform created successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      })
    }

    // DELETE - Remove user-specific platform
    if (req.method === 'DELETE') {
      const authHeader = req.headers.get('authorization')
      const user = await getAuthenticatedUser(supabaseClient, authHeader)

      const body = await req.json()

      if (!body.key) {
        throw new Error('Key is required')
      }

      // Check if it's a default platform
      const { data: isDefault } = await supabaseClient
        .from('default_platforms')
        .select('key')
        .eq('key', body.key)
        .single()

      if (isDefault) {
        throw new Error('Cannot delete default platform')
      }

      // Check if platform exists for user
      const { data: existing } = await supabaseClient
        .from('user_platforms')
        .select('key')
        .eq('user_id', user.id)
        .eq('key', body.key)
        .single()

      if (!existing) {
        return new Response(JSON.stringify({
          error: 'Platform not found'
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { error } = await supabaseClient
        .from('user_platforms')
        .delete()
        .eq('user_id', user.id)
        .eq('key', body.key)

      if (error) throw error

      return new Response(JSON.stringify({
        success: true,
        message: 'Platform deleted successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Platform Error:', error)

    const status = error.message === 'Unauthorized' || error.message.includes('authorization') ? 401 : 400

    return new Response(JSON.stringify({ error: error.message }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})