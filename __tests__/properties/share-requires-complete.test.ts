import { describe, it } from 'vitest'
import * as fc from 'fast-check'
import { type SessionStatus } from '@/types'

/**
 * Property 6: Shared view requires complete status
 * Validates: Requirements 6.1, 6.2
 *
 * Models the share route logic from app/share/[id]/page.tsx:
 *   - If session not found → 404 (notFound)
 *   - If session.status !== 'complete' → show "not available" message (not viewable)
 *   - If session.status === 'complete' → show debate content (viewable)
 */

/**
 * Models the viewability logic of the /share/[id] route as a pure function.
 * Returns true only if session exists AND session.status === 'complete'.
 */
function isViewable(session: { status: SessionStatus } | null): boolean {
  if (session === null) return false
  return session.status === 'complete'
}

describe('Property 6: Shared view requires complete status', () => {
  it('isViewable returns true if and only if session exists and status is complete', () => {
    /**
     * **Validates: Requirements 6.1, 6.2**
     *
     * Generate random sessions (or null) with random statuses.
     * Assert isViewable(session) === (session !== null && session.status === 'complete').
     */
    fc.assert(
      fc.property(
        fc.option(
          fc.record({ status: fc.constantFrom<SessionStatus>('processing', 'complete', 'failed') }),
          { nil: null }
        ),
        (session) => {
          const expected = session !== null && session.status === 'complete'
          return isViewable(session) === expected
        }
      ),
      { numRuns: 100 }
    )
  })

  it('non-existent session (null) is never viewable', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        (session) => {
          return isViewable(session) === false
        }
      ),
      { numRuns: 100 }
    )
  })

  it('processing session is never viewable', () => {
    fc.assert(
      fc.property(
        fc.record({ status: fc.constant<SessionStatus>('processing') }),
        (session) => {
          return isViewable(session) === false
        }
      ),
      { numRuns: 100 }
    )
  })

  it('failed session is never viewable', () => {
    fc.assert(
      fc.property(
        fc.record({ status: fc.constant<SessionStatus>('failed') }),
        (session) => {
          return isViewable(session) === false
        }
      ),
      { numRuns: 100 }
    )
  })

  it('complete session is always viewable', () => {
    fc.assert(
      fc.property(
        fc.record({ status: fc.constant<SessionStatus>('complete') }),
        (session) => {
          return isViewable(session) === true
        }
      ),
      { numRuns: 100 }
    )
  })
})
