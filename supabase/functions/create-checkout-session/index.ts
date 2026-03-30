import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.25.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2023-10-16',
})

function siteBaseUrl(): string {
  const u = Deno.env.get('PUBLIC_SITE_URL')?.trim()
  if (u) return u.replace(/\/$/, '')
  return 'http://localhost:5173'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    })
  }

  const priceId = Deno.env.get('STRIPE_PRICE_ID')
  if (!priceId) {
    console.error('Missing STRIPE_PRICE_ID')
    return new Response(
      JSON.stringify({ error: 'Server misconfiguration' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

  let userId: string | undefined
  let customerEmail: string | undefined

  const authHeader = req.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ') && anonKey) {
    const jwt = authHeader.replace('Bearer ', '')
    const supabaseAuth = createClient(supabaseUrl, anonKey)
    const { data: { user } } = await supabaseAuth.auth.getUser(jwt)
    if (user) {
      userId = user.id
      customerEmail = user.email ?? undefined
    }
  }

  const base = siteBaseUrl()

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/pricing`,
      customer_email: customerEmail,
      client_reference_id: userId,
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('create checkout session', e)
    return new Response(JSON.stringify({ error: 'Checkout failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
