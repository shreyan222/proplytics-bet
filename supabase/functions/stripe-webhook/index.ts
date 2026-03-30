import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.25.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  httpClient: Stripe.createFetchHttpClient(),
  apiVersion: '2023-10-16',
})

type SubRow = {
  stripe_customer_id: string
  stripe_subscription_id: string | null
  customer_email: string
  status: string
  current_period_end: string | null
  client_reference_id?: string | null
}

async function resolveCustomerEmail(
  customerId: string,
  fallback: string,
): Promise<string> {
  if (fallback) return fallback
  const c = await stripe.customers.retrieve(customerId)
  if (typeof c === 'string' || c.deleted) return ''
  return c.email ?? ''
}

async function upsertSubscriptionRow(
  supabase: ReturnType<typeof createClient>,
  row: SubRow,
) {
  const { data: existing } = await supabase
    .from('stripe_subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', row.stripe_customer_id)
    .maybeSingle()

  let userId: string | null = existing?.user_id ?? null
  const ref = row.client_reference_id
  if (!userId && ref && /^[0-9a-f-]{36}$/i.test(ref)) {
    userId = ref
  }

  const { error } = await supabase.from('stripe_subscriptions').upsert(
    {
      stripe_customer_id: row.stripe_customer_id,
      stripe_subscription_id: row.stripe_subscription_id,
      customer_email: row.customer_email,
      status: row.status,
      current_period_end: row.current_period_end,
      user_id: userId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'stripe_customer_id' },
  )
  if (error) {
    console.error('stripe_subscriptions upsert error', error)
    throw error
  }
}

serve(async (req) => {
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET')
    return new Response('Server misconfiguration', { status: 500 })
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return new Response('Missing stripe-signature', { status: 400 })
  }

  const body = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed', err)
    return new Response('Invalid signature', { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== 'subscription') break

        const customerId = session.customer as string
        const subId = session.subscription as string
        if (!customerId || !subId) {
          console.error('checkout.session.completed missing customer or subscription')
          break
        }

        const sub = await stripe.subscriptions.retrieve(subId)
        let email =
          session.customer_details?.email ||
          session.customer_email ||
          ''
        email = await resolveCustomerEmail(customerId, email)

        if (!email) {
          console.error('No email for customer', customerId)
          break
        }

        await upsertSubscriptionRow(supabase, {
          stripe_customer_id: customerId,
          stripe_subscription_id: subId,
          customer_email: email,
          status: sub.status,
          current_period_end: sub.current_period_end
            ? new Date(sub.current_period_end * 1000).toISOString()
            : null,
          client_reference_id: session.client_reference_id,
        })
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string
        let email = (sub as { customer_email?: string }).customer_email ?? ''
        email = await resolveCustomerEmail(customerId, email)
        if (!email) {
          const cust = await stripe.customers.retrieve(customerId)
          if (typeof cust !== 'string' && !cust.deleted) {
            email = cust.email ?? ''
          }
        }
        if (!email) {
          console.error('subscription event: no email', sub.id)
          break
        }

        const status =
          event.type === 'customer.subscription.deleted'
            ? 'canceled'
            : sub.status

        await upsertSubscriptionRow(supabase, {
          stripe_customer_id: customerId,
          stripe_subscription_id: sub.id,
          customer_email: email,
          status,
          current_period_end: sub.current_period_end
            ? new Date(sub.current_period_end * 1000).toISOString()
            : null,
        })
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const sub = invoice.subscription
        const subId =
          typeof sub === 'string'
            ? sub
            : sub && typeof sub === 'object' && 'id' in sub
              ? sub.id
              : null
        const customerId =
          typeof invoice.customer === 'string'
            ? invoice.customer
            : invoice.customer && typeof invoice.customer === 'object' && 'id' in invoice.customer
              ? invoice.customer.id
              : null
        if (!customerId) break

        let email = invoice.customer_email ?? ''
        email = await resolveCustomerEmail(customerId, email)
        if (!email) break

        let status = 'past_due'
        let periodEnd: string | null = null
        if (subId) {
          try {
            const s = await stripe.subscriptions.retrieve(subId)
            status = s.status
            periodEnd = s.current_period_end
              ? new Date(s.current_period_end * 1000).toISOString()
              : null
          } catch (_) {
            // keep past_due
          }
        }

        await upsertSubscriptionRow(supabase, {
          stripe_customer_id: customerId,
          stripe_subscription_id: subId,
          customer_email: email,
          status,
          current_period_end: periodEnd,
        })
        break
      }

      default:
        break
    }
  } catch (e) {
    console.error('Webhook handler error', e)
    return new Response('Handler error', { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
