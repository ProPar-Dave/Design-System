// supabase/functions/build-status/index.ts
// Build status tracking endpoint for Figma Make
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const headers = (origin: string | null) => ({
  'access-control-allow-origin': origin ?? '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'authorization, x-ping-token, content-type',
  'cache-control': 'no-store',
  'content-type': 'application/json',
})

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  if (req.method === 'OPTIONS') return new Response('ok', { headers: headers(origin) })

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
  const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const EXPECTED_TOKEN = Deno.env.get('PING_TOKEN') // optional but recommended

  const h = headers(origin)

  // Verify token if configured
  if (EXPECTED_TOKEN && req.headers.get('x-ping-token') !== EXPECTED_TOKEN) {
    return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), { 
      status: 401, 
      headers: h 
    })
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE)

  // POST → store build event
  if (req.method === 'POST') {
    try {
      const body = await req.json().catch(() => ({}))
      
      const row = {
        stage: String(body.stage ?? 'unknown'),
        at: new Date(body.at ?? Date.now()).toISOString(),
        app: String(body.app ?? 'adsm'),
        site_url: String(body.siteUrl ?? ''),
        commit: body.commit ? String(body.commit) : null,
        build_id: body.buildId ? String(body.buildId) : crypto.randomUUID(),
        version: body.version ? String(body.version) : null,
        message: body.message ? String(body.message) : null,
        job: body.job ? String(body.job) : null,
        payload: body,
      }

      const { error } = await supabase.from('build_status').insert(row)
      
      if (error) {
        console.error('[BUILD-STATUS] Insert error:', error)
        return new Response(JSON.stringify({ 
          ok: false, 
          error: error.message 
        }), { 
          status: 500, 
          headers: h 
        })
      }

      console.log('[BUILD-STATUS] Event stored:', { stage: row.stage, app: row.app, job: row.job })
      return new Response(JSON.stringify({ ok: true }), { headers: h })
      
    } catch (error) {
      console.error('[BUILD-STATUS] POST error:', error)
      return new Response(JSON.stringify({ 
        ok: false, 
        error: 'Invalid request' 
      }), { 
        status: 400, 
        headers: h 
      })
    }
  }

  // GET → return latest status
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('build_status')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error('[BUILD-STATUS] Query error:', error)
        return new Response(JSON.stringify({ 
          ok: false, 
          error: error.message 
        }), { 
          status: 500, 
          headers: h 
        })
      }

      return new Response(JSON.stringify({ 
        ok: true, 
        status: data ?? null 
      }), { 
        headers: h 
      })
      
    } catch (error) {
      console.error('[BUILD-STATUS] GET error:', error)
      return new Response(JSON.stringify({ 
        ok: false, 
        error: 'Query failed' 
      }), { 
        status: 500, 
        headers: h 
      })
    }
  }

  return new Response(JSON.stringify({ 
    ok: false, 
    error: 'Method not allowed' 
  }), { 
    status: 405, 
    headers: h 
  })
})