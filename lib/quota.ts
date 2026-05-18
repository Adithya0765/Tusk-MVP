import { createServerClient } from './supabase'
import { TIER_CONFIG, type Tier } from '../types'

export async function checkQuota(
  userId: string
): Promise<{ allowed: boolean; used: number; limit: number }> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('users')
    .select('quota_used, quota_limit, quota_reset_at')
    .eq('id', userId)
    .single()

  if (error || !data) {
    throw new Error(`Failed to fetch quota for user ${userId}: ${error?.message}`)
  }

  // Auto-reset if past reset date
  const now = new Date()
  const resetAt = new Date(data.quota_reset_at)
  if (now >= resetAt) {
    await resetMonthlyQuota(userId)
    return { allowed: true, used: 0, limit: data.quota_limit }
  }

  return {
    allowed: data.quota_used < data.quota_limit,
    used: data.quota_used,
    limit: data.quota_limit,
  }
}

export async function decrementQuota(userId: string): Promise<void> {
  const supabase = createServerClient()

  const { error } = await supabase.rpc('increment_quota_used', { user_id: userId })

  if (error) {
    // Fallback: manual increment if RPC not available
    const { data: user } = await supabase
      .from('users')
      .select('quota_used')
      .eq('id', userId)
      .single()

    if (user) {
      await supabase
        .from('users')
        .update({ quota_used: user.quota_used + 1 })
        .eq('id', userId)
    }
  }
}

export async function resetMonthlyQuota(userId: string): Promise<void> {
  const supabase = createServerClient()

  // Get current tier to set correct limit
  const { data: user } = await supabase
    .from('users')
    .select('tier')
    .eq('id', userId)
    .single()

  const tier = (user?.tier ?? 'free') as Tier
  const quotaLimit = TIER_CONFIG[tier].quotaLimit

  // Next reset = first day of next month at midnight UTC
  const now = new Date()
  const nextReset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))

  const { error } = await supabase
    .from('users')
    .update({
      quota_used: 0,
      quota_limit: quotaLimit,
      quota_reset_at: nextReset.toISOString(),
    })
    .eq('id', userId)

  if (error) {
    throw new Error(`Failed to reset quota for user ${userId}: ${error.message}`)
  }
}
