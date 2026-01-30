import { createClient } from '@/lib/supabase/server'
import { FREE_INSIGHTS_LIMIT, FREE_APPLICATIONS_LIMIT, FREE_COPILOT_DAILY_LIMIT, FREE_INTERVIEWS_LIMIT, type ProFeature } from './limits'

export type UserProfile = {
  plan: 'free' | 'pro'
  insights_used_this_month: number
  applications_used_this_month: number
  insights_reset_at: string
}

// Check if coupon has expired and downgrade user if needed
async function checkCouponExpiration(userId: string): Promise<void> {
  const supabase = await createClient()
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('plan, upgrade_source, coupon_expires_at')
    .eq('user_id', userId)
    .single()

  if (!profile) return

  // Check if user has coupon-based Pro that has expired
  if (
    profile.plan === 'pro' && 
    profile.upgrade_source === 'coupon' && 
    profile.coupon_expires_at &&
    new Date(profile.coupon_expires_at) < new Date()
  ) {
    // Coupon expired - downgrade to Free
    // Keep coupon_code and coupon_applied_at for history (prevents reuse)
    await supabase
      .from('user_profiles')
      .update({
        plan: 'free',
        upgrade_source: null,
        subscription_status: 'expired',
        coupon_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createClient()
  
  // Check coupon expiration first
  await checkCouponExpiration(userId)
  
  let { data } = await supabase
    .from('user_profiles')
    .select('plan, insights_used_this_month, applications_used_this_month, insights_reset_at')
    .eq('user_id', userId)
    .single()
  
  // If profile doesn't exist, create it (fallback for when trigger didn't fire)
  if (!data) {
    const nextReset = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
    const { data: newProfile, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        plan: 'free',
        insights_used_this_month: 0,
        applications_used_this_month: 0,
        insights_reset_at: nextReset.toISOString()
      })
      .select('plan, insights_used_this_month, applications_used_this_month, insights_reset_at')
      .single()
    
    if (error) {
      console.error('Error creating user profile:', error)
      return null
    }
    
    data = newProfile
  }

  if (!data) return null

  // Reset counters if month changed
  if (new Date(data.insights_reset_at) < new Date()) {
    const nextReset = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
    await supabase
      .from('user_profiles')
      .update({
        insights_used_this_month: 0,
        applications_used_this_month: 0,
        insights_reset_at: nextReset.toISOString()
      })
      .eq('user_id', userId)
    data.insights_used_this_month = 0
    data.applications_used_this_month = 0
  }

  return data
}

export async function canAddApplication(userId: string): Promise<{
  allowed: boolean
  current: number
  limit: number
  plan: 'free' | 'pro'
}> {
  const profile = await getUserProfile(userId)
  
  if (!profile) {
    return { allowed: false, current: 0, limit: FREE_APPLICATIONS_LIMIT, plan: 'free' }
  }

  if (profile.plan === 'pro') {
    return { allowed: true, current: profile.applications_used_this_month, limit: Infinity, plan: 'pro' }
  }

  const currentCount = profile.applications_used_this_month
  const allowed = currentCount < FREE_APPLICATIONS_LIMIT

  return {
    allowed,
    current: currentCount,
    limit: FREE_APPLICATIONS_LIMIT,
    plan: 'free'
  }
}

export async function canGenerateInsight(userId: string): Promise<{
  allowed: boolean
  remaining: number
  limit: number
  plan: 'free' | 'pro'
}> {
  const profile = await getUserProfile(userId)
  
  if (!profile) {
    return { allowed: false, remaining: 0, limit: FREE_INSIGHTS_LIMIT, plan: 'free' }
  }

  if (profile.plan === 'pro') {
    return { allowed: true, remaining: Infinity, limit: Infinity, plan: 'pro' }
  }

  const remaining = FREE_INSIGHTS_LIMIT - profile.insights_used_this_month
  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining),
    limit: FREE_INSIGHTS_LIMIT,
    plan: 'free'
  }
}

export async function canAccessFeature(userId: string, feature: ProFeature): Promise<boolean> {
  const profile = await getUserProfile(userId)
  return profile?.plan === 'pro'
}

export async function canUseCopilot(userId: string): Promise<{
  allowed: boolean
  used: number
  limit: number
  plan: 'free' | 'pro'
}> {
  const supabase = await createClient()
  
  // Get profile with copilot usage
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('plan, copilot_messages_today, copilot_reset_at')
    .eq('user_id', userId)
    .single()
  
  if (!profile) {
    return { allowed: false, used: 0, limit: FREE_COPILOT_DAILY_LIMIT, plan: 'free' }
  }

  let currentCount = profile.copilot_messages_today || 0

  // Reset counter if day changed
  if (profile.copilot_reset_at && new Date(profile.copilot_reset_at) < new Date()) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    await supabase
      .from('user_profiles')
      .update({
        copilot_messages_today: 0,
        copilot_reset_at: tomorrow.toISOString()
      })
      .eq('user_id', userId)
    currentCount = 0
  }

  if (profile.plan === 'pro') {
    return { allowed: true, used: currentCount, limit: Infinity, plan: 'pro' }
  }

  const allowed = currentCount < FREE_COPILOT_DAILY_LIMIT

  return {
    allowed,
    used: currentCount,
    limit: FREE_COPILOT_DAILY_LIMIT,
    plan: 'free'
  }
}

export async function canUseInterviewPro(userId: string): Promise<{
  allowed: boolean
  used: number
  limit: number
  plan: 'free' | 'pro'
  isTrialAvailable: boolean
}> {
  const supabase = await createClient()
  
  // Check coupon expiration first
  await checkCouponExpiration(userId)
  
  // Get profile with interviews_used
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('plan, interviews_used')
    .eq('user_id', userId)
    .single()
  
  if (!profile) {
    return { 
      allowed: true, 
      used: 0, 
      limit: FREE_INTERVIEWS_LIMIT, 
      plan: 'free',
      isTrialAvailable: true 
    }
  }

  const used = profile.interviews_used || 0

  // Pro users: unlimited access
  if (profile.plan === 'pro') {
    return { 
      allowed: true, 
      used, 
      limit: Infinity, 
      plan: 'pro',
      isTrialAvailable: false 
    }
  }

  // Free users: 1 trial vitalicio
  const isTrialAvailable = used < FREE_INTERVIEWS_LIMIT

  return {
    allowed: isTrialAvailable,
    used,
    limit: FREE_INTERVIEWS_LIMIT,
    plan: 'free',
    isTrialAvailable
  }
}
