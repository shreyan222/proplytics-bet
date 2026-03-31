import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

type GetPropsRequest = {
  table: string
  limitFree?: number
  orderBy?: { column: string; ascending?: boolean }[]
  filters?: {
    eq?: Record<string, string | number | boolean | null>
    in?: Record<string, (string | number)[]>
    gte?: Record<string, string | number>
    lte?: Record<string, string | number>
  }
  select?: string
}

type GetPropsResponse = {
  data: unknown[]
  isPremium: boolean
  locked: boolean
}

function jsonResponse(body: Json, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
}

function normalizeEmail(email: string) {
  return email.toLowerCase().trim()
}

function isAllowedTable(table: string) {
  return table === 'props' || table === 'prop_yday'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, { status: 405 })
  }

  let payload: GetPropsRequest
  try {
    payload = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const table = payload?.table?.trim()
  if (!table) {
    return jsonResponse({ error: 'Missing table' }, { status: 400 })
  }

  if (!isAllowedTable(table)) {
    return jsonResponse({ error: 'Table not allowed' }, { status: 400 })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error('Missing Supabase env vars')
    return jsonResponse({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const authHeader = req.headers.get('Authorization') ?? ''
  const jwt = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : ''

  if (!jwt) {
    return jsonResponse({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseAuth = createClient(supabaseUrl, anonKey)
  const {
    data: { user },
    error: userError,
  } = await supabaseAuth.auth.getUser(jwt)

  if (userError || !user) {
    return jsonResponse({ error: 'Unauthorized' }, { status: 401 })
  }

  const email = user.email ? normalizeEmail(user.email) : ''
  if (!email) {
    return jsonResponse({ error: 'User email missing' }, { status: 400 })
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  const { data: premiumRow, error: premiumErr } = await admin
    .from('premium_users')
    .select('email')
    .ilike('email', email)
    .maybeSingle()

  if (premiumErr) {
    console.error('premium_users lookup failed', premiumErr)
    return jsonResponse({ error: 'Premium lookup failed' }, { status: 500 })
  }

  const isPremium = !!premiumRow
  const locked = !isPremium
  const limitFree = typeof payload.limitFree === 'number' && payload.limitFree > 0 ? payload.limitFree : 10

  const select = payload.select?.trim()
    ? payload.select
    : `
      *,
      player:players (
        id,
        display_name,
        position,
        team:teams (
          abbreviation
        )
      ),
      game:games (
        id,
        start_time,
        home_team:home_team_id (
          abbreviation
        ),
        away_team:away_team_id (
          abbreviation
        )
      )
    `

  let query = admin.from(table).select(select)

  const orderBy = payload.orderBy?.length ? payload.orderBy : [{ column: 'sorting_score_computed', ascending: false }]
  for (const ord of orderBy) {
    if (ord?.column) {
      query = query.order(ord.column, { ascending: !!ord.ascending })
    }
  }

  const f = payload.filters
  if (f?.eq) {
    for (const [k, v] of Object.entries(f.eq)) query = query.eq(k, v as any)
  }
  if (f?.in) {
    for (const [k, v] of Object.entries(f.in)) query = query.in(k, v as any)
  }
  if (f?.gte) {
    for (const [k, v] of Object.entries(f.gte)) query = query.gte(k, v as any)
  }
  if (f?.lte) {
    for (const [k, v] of Object.entries(f.lte)) query = query.lte(k, v as any)
  }

  if (locked) {
    query = query.limit(limitFree)
  }

  const { data, error } = await query
  if (error) {
    console.error('get-props query failed', { table, error })
    return jsonResponse({ error: 'Query failed' }, { status: 500 })
  }

  const response: GetPropsResponse = {
    data: data ?? [],
    isPremium,
    locked,
  }

  return jsonResponse(response)
})

