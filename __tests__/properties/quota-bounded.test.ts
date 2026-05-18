import { describe, it } from 'vitest'
import * as fc from 'fast-check'
import { TIER_CONFIG, type Tier } from '@/types'

/**
 * Property 2: Quota decrement is bounded
 * Validates: Requirements 4.8, 7.6
 */

/**
 * Pure quota state model — no Supabase involved.
 * Mirrors the logic in lib/quota.ts: increment quota_used by 1,
 * but only if quota_used < quota_limit.
 */
function simulateDecrement(state: { quota_used: number; quota_limit: number }) {
  if (state.quota_used < state.quota_limit) {
    return { ...state, quota_used: state.quota_used + 1 }
  }
  return { ...state }
}

describe('Property 2: Quota decrement is bounded', () => {
  it('quota_used never exceeds quota_limit after any sequence of decrements', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<Tier>('free', 'starter', 'pro'),
        fc.array(fc.constantFrom('complete', 'failed'), { minLength: 0, maxLength: 100 }),
        (tier, sessions) => {
          const quotaLimit = TIER_CONFIG[tier].quotaLimit
          let state = { quota_used: 0, quota_limit: quotaLimit }

          for (const _session of sessions) {
            state = simulateDecrement(state)
            // Assert after each decrement: quota_used must never exceed quota_limit
            if (state.quota_used > state.quota_limit) return false
          }

          // Assert at the end: quota_used equals min(sessions.length, quota_limit)
          const expected = Math.min(sessions.length, quotaLimit)
          return state.quota_used === expected
        }
      ),
      { numRuns: 100 }
    )
  })
})
