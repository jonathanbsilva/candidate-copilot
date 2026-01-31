import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Nao autenticado' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { immediate } = body // true = cancel now, false = cancel at period end

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('subscription_id, plan, upgrade_source')
      .eq('user_id', user.id)
      .single()

    if (!profile || profile.plan !== 'pro') {
      return NextResponse.json(
        { error: 'Você não tem uma assinatura ativa' },
        { status: 400 }
      )
    }

    // Check if user paid via Stripe or got free upgrade
    const isStripeSubscription = profile.upgrade_source === 'stripe'

    if (isStripeSubscription && profile.subscription_id) {
      // Has Stripe subscription - use Stripe to cancel
      if (immediate) {
        // Cancel immediately
        await stripe.subscriptions.cancel(profile.subscription_id)
        
        // Update profile to Free
        await supabase
          .from('user_profiles')
          .update({
            plan: 'free',
            subscription_status: 'canceled',
            subscription_id: null,
            current_period_end: null,
            upgrade_source: null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
      } else {
        // Cancel at end of period
        await stripe.subscriptions.update(profile.subscription_id, {
          cancel_at_period_end: true,
        })
        
        // Update status to reflect pending cancellation
        await supabase
          .from('user_profiles')
          .update({
            subscription_status: 'canceling',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
      }
    } else {
      // Free upgrade (whitelist or coupon) - just downgrade directly, no Stripe call needed
      // Keep coupon_code and coupon_applied_at for history (prevents reuse)
      await supabase
        .from('user_profiles')
        .update({
          plan: 'free',
          subscription_status: 'inactive',
          upgrade_source: null,
          coupon_expires_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
    }

    return NextResponse.json({ 
      success: true, 
      immediate,
      message: immediate 
        ? 'Assinatura cancelada. Voce foi movido para o plano Free.'
        : 'Assinatura sera cancelada no fim do periodo atual.'
    })
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json(
      { error: 'Erro ao cancelar assinatura' },
      { status: 500 }
    )
  }
}
