'use server'

import { createClient } from '@/lib/supabase/server'

export async function incrementInsightUsage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get current value and increment
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('insights_used_this_month')
    .eq('user_id', user.id)
    .single()

  await supabase
    .from('user_profiles')
    .update({
      insights_used_this_month: (profile?.insights_used_this_month || 0) + 1,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id)
}

export async function incrementApplicationUsage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get current value and increment
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('applications_used_this_month')
    .eq('user_id', user.id)
    .single()

  await supabase
    .from('user_profiles')
    .update({
      applications_used_this_month: (profile?.applications_used_this_month || 0) + 1,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id)
}

export async function incrementCopilotUsage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get current values
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('copilot_messages_today, copilot_reset_at')
    .eq('user_id', user.id)
    .single()

  if (!profile) return

  // Check if we need to reset (new day)
  const now = new Date()
  let currentCount = profile.copilot_messages_today || 0
  
  if (profile.copilot_reset_at && new Date(profile.copilot_reset_at) < now) {
    currentCount = 0
  }

  // Calculate next reset (tomorrow at midnight)
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  await supabase
    .from('user_profiles')
    .update({
      copilot_messages_today: currentCount + 1,
      copilot_reset_at: tomorrow.toISOString(),
      updated_at: now.toISOString()
    })
    .eq('user_id', user.id)
}

// Get current user's profile
export async function getCurrentUserProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return profile
}

export async function incrementInterviewUsage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get current value and increment
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('interviews_used')
    .eq('user_id', user.id)
    .single()

  await supabase
    .from('user_profiles')
    .update({
      interviews_used: (profile?.interviews_used || 0) + 1,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id)
}
