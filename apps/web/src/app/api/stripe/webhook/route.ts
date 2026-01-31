import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe/client'
import { STRIPE_CONFIG } from '@/lib/stripe/config'
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import type Stripe from 'stripe'

// Create admin Supabase client for webhook (no user context)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * In your Stripe API shape, Subscription no longer has current_period_end at top-level.
 * Derive it from Subscription Items (works for 1+ items).
 */
function getCurrentPeriodEnd(subscription: Stripe.Subscription): number | null {
  const items = subscription.items?.data ?? []
  if (items.length === 0) return null

  // Use the earliest period end among items (closest upcoming end).
  return items.reduce<number | null>((min, it) => {
    const end = it.current_period_end ?? null
    if (end == null) return min
    return min == null ? end : Math.min(min, end)
  }, null)
}

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      STRIPE_CONFIG.webhookSecret
    )
  } catch (err) {
    logger.error('Webhook signature verification failed', { 
      error: err instanceof Error ? err.message : 'Unknown error',
      feature: 'stripe'
    })
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentSucceeded(invoice)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(invoice)
        break
      }

      default:
        logger.debug('Evento Stripe não tratado', { eventType: event.type, feature: 'stripe' })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error('Erro ao processar webhook Stripe', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      eventType: event.type,
      feature: 'stripe'
    })
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.supabase_user_id
  if (!userId) {
    logger.error('No user ID in checkout session metadata', { 
      sessionId: session.id,
      feature: 'stripe'
    })
    return
  }

  const subscriptionId = session.subscription as string

  // Stripe v20 returns Stripe.Response<Stripe.Subscription>
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)

  const periodEnd = getCurrentPeriodEnd(subscription)
  const currentPeriodEndIso = periodEnd
    ? new Date(periodEnd * 1000).toISOString()
    : null

  await supabaseAdmin
    .from('user_profiles')
    .update({
      plan: 'pro',
      subscription_id: subscriptionId,
      subscription_status: subscription.status,
      current_period_end: currentPeriodEndIso,
      upgrade_source: 'stripe',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  // Get user by customer ID
  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!profile) {
    logger.error('Nenhum usuário encontrado para customer Stripe', { 
      customerId,
      subscriptionId: subscription.id,
      feature: 'stripe'
    })
    return
  }

  const isActive = ['active', 'trialing'].includes(subscription.status)

  const periodEnd = getCurrentPeriodEnd(subscription)
  const currentPeriodEndIso = periodEnd
    ? new Date(periodEnd * 1000).toISOString()
    : null

  await supabaseAdmin
    .from('user_profiles')
    .update({
      plan: isActive ? 'pro' : 'free',
      subscription_status: subscription.status,
      current_period_end: currentPeriodEndIso,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', profile.user_id)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!profile) {
    logger.error('Nenhum usuário encontrado para customer Stripe (subscription deleted)', { 
      customerId,
      subscriptionId: subscription.id,
      feature: 'stripe'
    })
    return
  }

  await supabaseAdmin
    .from('user_profiles')
    .update({
      plan: 'free',
      subscription_id: null,
      subscription_status: 'canceled',
      current_period_end: null,
      upgrade_source: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', profile.user_id)
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  // Renewal payment succeeded - subscription status already handled by subscription.updated
  logger.info('Pagamento de renovação bem-sucedido', { 
    invoiceId: invoice.id,
    customerId: invoice.customer as string,
    feature: 'stripe'
  })
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!profile) {
    logger.error('Nenhum usuário encontrado para customer Stripe (payment failed)', { 
      customerId,
      invoiceId: invoice.id,
      feature: 'stripe'
    })
    return
  }

  // Mark subscription as past_due
  await supabaseAdmin
    .from('user_profiles')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', profile.user_id)
}
