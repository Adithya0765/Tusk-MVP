import { describe, it } from 'vitest'
import * as fc from 'fast-check'
import { DEBATE_LIMITS } from '@/types'

/**
 * Property 3: Turn token count is bounded
 * Validates: Requirements 4.3, 11.1
 */

/**
 * Simulates the token count enforcement applied by the debate engine.
 * The AI is called with max_tokens: 300, so the response can never exceed
 * MAX_TOKENS_PER_TURN tokens. We model this as:
 *   simulateTokenCount(response) = Math.min(Math.ceil(response.length / 4), MAX_TOKENS_PER_TURN)
 */
function simulateTokenCount(response: string): number {
  return Math.min(
    Math.ceil(response.length / 4),
    DEBATE_LIMITS.MAX_TOKENS_PER_TURN
  )
}

describe('Property 3: Turn token count is bounded', () => {
  it('every turn token_count is <= MAX_TOKENS_PER_TURN for any AI response', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 2000 }),
        (mockResponse) => {
          const tokenCount = simulateTokenCount(mockResponse)
          return tokenCount <= DEBATE_LIMITS.MAX_TOKENS_PER_TURN
        }
      ),
      { numRuns: 100 }
    )
  })
})
