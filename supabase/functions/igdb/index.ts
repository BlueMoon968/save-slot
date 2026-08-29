import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
}

let cachedToken: string | null = null
let tokenExpiry = 0

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken

  const clientId = Deno.env.get('IGDB_CLIENT_ID')
  const clientSecret = Deno.env.get('IGDB_CLIENT_SECRET')
  if (!clientId || !clientSecret) {
    throw new Error('IGDB_CLIENT_ID or IGDB_CLIENT_SECRET not set in Edge Function secrets')
  }

  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    { method: 'POST' }
  )
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Twitch OAuth failed ${res.status}: ${body}`)
  }
  const data = await res.json()
  cachedToken = data.access_token
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000
  return cachedToken!
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  try {
    const { endpoint, query } = await req.json()
    if (!endpoint || !query) {
      return new Response(JSON.stringify({ error: 'Missing endpoint or query' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      })
    }

    const clientId = Deno.env.get('IGDB_CLIENT_ID')!
    const token = await getAccessToken()

    const igdbRes = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
      body: query,
    })

    const data = await igdbRes.json()
    return new Response(JSON.stringify(data), {
      status: igdbRes.status,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[igdb function error]', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    })
  }
})
