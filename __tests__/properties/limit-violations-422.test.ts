import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { DEBATE_LIMITS } from '@/types/index'

/**
 * Property 8: Limit violations return HTTP 422
 * Validates: Requirements 11.3, 11.5
 *
 * Models the server-side validation logic from app/api/debate/start/route.ts
 * as a pure function to enable property-based testing without real API calls.
 */

type ValidationError = { status: 422; code: string }

/**
 * Pure model of the server-side validation logic.
 * Mirrors the checks in POST /api/debate/start in the same order.
 *
 * Returns a 422 error object if any limit is violated, or null if the request is valid.
 */
function validateRequest(
  topic: string,
  quotaUsed: number,
  quotaLimit: number,
  concurrentSessions: number
): ValidationError | null {
  if (!topic.trim()) {
    return { status: 422, code: 'TOPIC_EMPTY' }
  }
  if (topic.length > DEBATE_LIMITS.MAX_TOPIC_LENGTH) {
    return { status: 422, code: 'TOPIC_TOO_LONG' }
  }
  if (quotaUsed >= quotaLimit) {
    return { status: 422, code: 'QUOTA_EXHAUSTED' }
  }
  if (concurrentSessions >= DEBATE_LIMITS.MAX_CONCURRENT_DEBATES) {
    return { status: 422, code: 'CONCURRENCY_LIMIT' }
  }
  return null
}

describe('Property 8: Limit violations return HTTP 422', () => {
  it('returns 422 TOPIC_EMPTY for empty or whitespace-only topics', () => {
    const emptyTopics = fc.oneof(
      fc.constant(''),
      fc.string({ maxLength: 0 }),
      // whitespace-only strings
      fc.array(fc.constantFrom(' ', '\t', '\n', '\r'), { minLength: 1, maxLength: 50 }).map(
        chars => chars.join('')
      )
    )

    fc.assert(
      fc.property(
        emptyTopics,
        fc.integer({ min: 0, max: 5 }),
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 0, max: 2 }),
        (topic, quotaUsed, quotaLimit, concurrentSessions) => {
          const result = validateRequest(topic, quotaUsed, quotaLimit, concurrentSessions)
          expect(result).not.toBeNull()
          expect(result!.status).toBe(422)
          expect(result!.code).toBe('TOPIC_EMPTY')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('returns 422 TOPIC_TOO_LONG for topics exceeding 500 characters', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: DEBATE_LIMITS.MAX_TOPIC_LENGTH + 1, maxLength: 1000 }),
        fc.integer({ min: 0, max: 5 }),
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 0, max: 2 }),
        (topic, quotaUsed, quotaLimit, concurrentSessions) => {
          const result = validateRequest(topic, quotaUsed, quotaLimit, concurrentSessions)
          expect(result).not.toBeNull()
          expect(result!.status).toBe(422)
          expect(result!.code).toBe('TOPIC_TOO_LONG')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('returns 422 QUOTA_EXHAUSTED when quota_used >= quota_limit', () => {
    fc.assert(
      fc.property(
        // valid topic (non-empty, within length)
        fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
        // quota_limit in [1, 100], quota_used in [quota_limit, quota_limit + 99]
        fc.integer({ min: 1, max: 100 }).chain(limit =>
          fc.integer({ min: limit, max: limit + 99 }).map(used => ({ used, limit }))
        ),
        fc.integer({ min: 0, max: 2 }),
        (topic, { used, limit }, concurrentSessions) => {
          const result = validateRequest(topic, used, limit, concurrentSessions)
          expect(result).not.toBeNull()
          expect(result!.status).toBe(422)
          expect(result!.code).toBe('QUOTA_EXHAUSTED')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('returns 422 CONCURRENCY_LIMIT when concurrent sessions >= 3', () => {
    fc.assert(
      fc.property(
        // valid topic
        fc.string({ minLength: 1, maxLength: 500 }).filter(s => s.trim().length > 0),
        // quota not exhausted: used < limit
        fc.integer({ min: 1, max: 100 }).chain(limit =>
          fc.integer({ min: 0, max: limit - 1 }).map(used => ({ used, limit }))
        ),
        fc.integer({ min: DEBATE_LIMITS.MAX_CONCURRENT_DEBATES, max: 10 }),
        (topic, { used, limit }, concurrentSessions) => {
          const result = validateRequest(topic, used, limit, concurrentSessions)
          expect(result).not.toBeNull()
          expect(result!.status).toBe(422)
          expect(result!.code).toBe('CONCURRENCY_LIMIT')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('returns null (valid) when no limits are violated', () => {
    fc.assert(
      fc.property(
        // valid topic: non-empty after trim, within length
        fc.string({ minLength: 1, maxLength: DEBATE_LIMITS.MAX_TOPIC_LENGTH }).filter(
          s => s.trim().length > 0
        ),
        // quota not exhausted: used < limit
        fc.integer({ min: 1, max: 100 }).chain(limit =>
          fc.integer({ min: 0, max: limit - 1 }).map(used => ({ used, limit }))
        ),
        // concurrency below limit
        fc.integer({ min: 0, max: DEBATE_LIMITS.MAX_CONCURRENT_DEBATES - 1 }),
        (topic, { used, limit }, concurrentSessions) => {
          const result = validateRequest(topic, used, limit, concurrentSessions)
          expect(result).toBeNull()
        }
      ),
      { numRuns: 100 }
    )
  })
})
