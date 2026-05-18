import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

/**
 * Property 10: Session ownership enforces 404
 * Validates: Requirements 5.6
 *
 * Models the ownership check logic from app/api/debate/[id]/route.ts
 * as a pure function to enable property-based testing without real API calls.
 *
 * The actual route logic:
 *   - If session not found → 404
 *   - If session.user_id !== requestingUserId → 404
 *   - Otherwise → 200 with session data
 */

/**
 * Pure model of the ownership check performed in GET /api/debate/[id]
 * and GET /api/debate/[id]/status.
 */
function checkOwnership(
  requestingUserId: string,
  session: { user_id: string } | null
): number {
  if (session === null) return 404
  if (session.user_id !== requestingUserId) return 404
  return 200
}

describe('Property 10: Session ownership enforces 404', () => {
  it('returns 404 when requesting user does not own the session', () => {
    fc.assert(
      fc.property(
        fc.tuple(fc.uuid(), fc.uuid()).filter(([a, b]) => a !== b),
        ([userId1, userId2]) => {
          const result = checkOwnership(userId1, { user_id: userId2 })
          expect(result).toBe(404)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('returns 200 when requesting user owns the session', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        (userId) => {
          const result = checkOwnership(userId, { user_id: userId })
          expect(result).toBe(200)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('returns 404 for non-existent sessions (null)', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        (userId) => {
          const result = checkOwnership(userId, null)
          expect(result).toBe(404)
        }
      ),
      { numRuns: 100 }
    )
  })
})
