import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimitMiddleware, RATE_LIMITS } from '@/lib/rate-limit'

export async function POST(req: Request) {
  // Rate limiting
  const { response: rateLimitResponse } = rateLimitMiddleware(req, RATE_LIMITS.coupon)
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
      .select('plan, coupon_applied_at')
      .eq('user_id', user.id)
      .single()

    if (profile?.plan === 'pro') {
      return NextResponse.json(
        { error: 'Voce ja tem o plano Pro ativo' },
        { status: 400 }
      )
    }

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

    // Calculate prices
    const originalPrice = 19 // R$ 19/month
    const discountedPrice = originalPrice * (1 - coupon.discount_percent / 100)

    return NextResponse.json({
      valid: true,
      code: couponCode,
      discount_percent: coupon.discount_percent,
      duration_months: coupon.duration_months,
      original_price: originalPrice,
      discounted_price: discountedPrice,
    })
  } catch (error) {
    console.error('Error validating coupon:', error)
    return NextResponse.json(
      { error: 'Erro ao validar cupom' },
      { status: 500 }
    )
  }
}
