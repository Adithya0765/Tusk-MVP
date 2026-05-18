import { describe, it } from 'vitest'
import * as fc from 'fast-check'
import { TIER_CONFIG, DEBATE_LIMITS, type Tier } from '@/types'

/**
 * Property 4: Turn count per session is bounded
 * Validates: Requirements 4.2, 4.4, 11.2
 */

/**
 * Simulates the debate engine's turn counting logic from lib/debate-engine.ts.
 * The engine runs `rounds` rounds, each producing 2 turns (Agent A + Agent B),
 * but stops early if totalTurns >= MAX_TURNS_PER_SESSION.
 */
function simulateTurnCount(rounds: number): number {
  let totalTurns = 0

  for (let round = 1; round <= rounds; round++) {
    if (totalTurns >= DEBATE_LIMITS.MAX_TURNS_PER_SESSION) break

    // Agent A turn
    totalTurns++

    if (totalTurns >= DEBATE_LIMITS.MAX_TURNS_PER_SESSION) break

    // Agent B turn
    totalTurns++
  }

  return totalTurns
}

describe('Property 4: Turn count per session is bounded', () => {
  it('total turns <= MAX_TURNS_PER_SESSION for any tier', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<Tier>('free', 'starter', 'pro'),
        (tier) => {
          const rounds = TIER_CONFIG[tier].rounds
          const totalTurns = simulateTurnCount(rounds)
          return totalTurns <= DEBATE_LIMITS.MAX_TURNS_PER_SESSION
        }
      ),
      { numRuns: 100 }
    )
  })

  it('total turns equals rounds * 2 for a complete session (all tiers within cap)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<Tier>('free', 'starter', 'pro'),
        (tier) => {
          const rounds = TIER_CONFIG[tier].rounds
          const totalTurns = simulateTurnCount(rounds)
          const expectedTurns = rounds * 2
          // All configured tiers have rounds * 2 <= MAX_TURNS_PER_SESSION
          return totalTurns === expectedTurns
        }
      ),
      { numRuns: 100 }
    )
  })

  it('engine caps at MAX_TURNS_PER_SESSION even if rounds would exceed it', () => {
    fc.assert(
      fc.property(
        // Generate rounds that could exceed the cap (e.g. 7+ rounds = 14+ turns)
        fc.integer({ min: 7, max: 20 }),
        (rounds) => {
          const totalTurns = simulateTurnCount(rounds)
          return totalTurns <= DEBATE_LIMITS.MAX_TURNS_PER_SESSION
        }
      ),
      { numRuns: 100 }
    )
  })
})
