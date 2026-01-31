import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimitMiddleware, RATE_LIMITS } from '@/lib/rate-limit'

export async function POST(req: Request) {
  // Rate limiting (mais restritivo para aplicacao de cupom)
  const { response: rateLimitResponse } = rateLimitMiddleware(req, RATE_LIMITS.couponApply)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

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
    const { code } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Codigo do cupom invalido' },
        { status: 400 }
      )
    }

    const couponCode = code.trim().toUpperCase()

    // Check if user already has Pro or has used a coupon before
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('plan, coupon_code, coupon_applied_at')
      .eq('user_id', user.id)
      .single()

    if (profile?.plan === 'pro') {
      return NextResponse.json(
        { error: 'Voce ja tem o plano Pro ativo' },
        { status: 400 }
      )
    }

    // Check if user has already used a coupon before (even if expired)
    if (profile?.coupon_applied_at) {
      return NextResponse.json(
        { error: 'Voce ja usou um cupom anteriormente' },
        { status: 400 }
      )
    }

    // Find the coupon
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode)
      .eq('is_active', true)
      .single()

    if (couponError || !coupon) {
      return NextResponse.json(
        { error: 'Cupom invalido ou expirado' },
        { status: 400 }
      )
    }

    // Check if coupon is valid
    const now = new Date()
    
    if (new Date(coupon.valid_from) > now) {
      return NextResponse.json(
        { error: 'Este cupom ainda não está ativo' },
        { status: 400 }
      )
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return NextResponse.json(
        { error: 'Este cupom expirou' },
        { status: 400 }
      )
    }

    if (coupon.max_uses !== null && coupon.times_used >= coupon.max_uses) {
      return NextResponse.json(
        { error: 'Este cupom atingiu o limite de usos' },
        { status: 400 }
      )
    }

    // Calculate expiration date (properly handle month overflow)
    const expiresAt = new Date()
    const targetMonth = expiresAt.getMonth() + coupon.duration_months
    expiresAt.setMonth(targetMonth)
    
    // If the day changed (overflow), go to last day of previous month
    // e.g., Jan 31 + 1 month should be Feb 28, not Mar 3
    if (expiresAt.getDate() !== now.getDate()) {
      expiresAt.setDate(0) // Goes to last day of previous month
    }

    // Apply coupon - upgrade user to Pro (upsert to handle missing profiles)
    const { error: upsertError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        plan: 'pro',
        upgrade_source: 'coupon',
        subscription_status: 'active',
        coupon_code: couponCode,
        coupon_applied_at: now.toISOString(),
        coupon_expires_at: expiresAt.toISOString(),
        updated_at: now.toISOString(),
      }, {
        onConflict: 'user_id'
      })

    if (upsertError) {
      console.error('Error applying coupon:', upsertError)
      return NextResponse.json(
        { error: 'Erro ao aplicar cupom' },
        { status: 500 }
      )
    }

    // Increment coupon usage
    await supabase
      .from('coupons')
      .update({ times_used: coupon.times_used + 1 })
      .eq('id', coupon.id)

    return NextResponse.json({
      success: true,
      discount_percent: coupon.discount_percent,
      duration_months: coupon.duration_months,
      expires_at: expiresAt.toISOString(),
      message: `Cupom aplicado! Voce tem ${coupon.duration_months} ${coupon.duration_months === 1 ? 'mes' : 'meses'} de Pro gratis.`
    })
  } catch (error) {
    console.error('Error applying coupon:', error)
    return NextResponse.json(
      { error: 'Erro ao aplicar cupom' },
      { status: 500 }
    )
  }
}
