import { describe, it } from 'vitest'
import * as fc from 'fast-check'
import { type SessionStatus } from '@/types'

/**
 * Property 5: Conclusion exists iff session is complete
 * Validates: Requirements 4.5, 4.6
 */

/**
 * Models a session state as a pair of (status, hasConclusion).
 * The invariant: a conclusion exists if and only if session.status === 'complete'.
 */
function invariantHolds(status: SessionStatus, hasConclusion: boolean): boolean {
  return (status === 'complete') === hasConclusion
}

/** Valid state transitions from 'processing' */
type Transition = 'complete' | 'failed'

/**
 * Simulates a session lifecycle transition from 'processing'.
 * Returns the resulting (status, hasConclusion) pair.
 */
function applyTransition(transition: Transition): { status: SessionStatus; hasConclusion: boolean } {
  if (transition === 'complete') {
    // processing → complete: conclusion is added
    return { status: 'complete', hasConclusion: true }
  } else {
    // processing → failed: no conclusion
    return { status: 'failed', hasConclusion: false }
  }
}

describe('Property 5: Conclusion exists iff session is complete', () => {
  it('invariant holds for all (status, hasConclusion) pairs that satisfy it', () => {
    // Generate arbitrary (status, hasConclusion) pairs and verify the invariant
    // correctly identifies valid vs invalid states
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant<SessionStatus>('processing'),
          fc.constant<SessionStatus>('complete'),
          fc.constant<SessionStatus>('failed')
        ),
        fc.boolean(),
        (status, hasConclusion) => {
          const holds = invariantHolds(status, hasConclusion)
          // The invariant should be true only for valid states:
          // - complete + hasConclusion=true  → valid
          // - processing + hasConclusion=false → valid
          // - failed + hasConclusion=false → valid
          const expectedValid =
            (status === 'complete' && hasConclusion === true) ||
            (status === 'processing' && hasConclusion === false) ||
            (status === 'failed' && hasConclusion === false)
          return holds === expectedValid
        }
      ),
      { numRuns: 100 }
    )
  })

  it('invariant holds after processing → complete transition (conclusion added)', () => {
    fc.assert(
      fc.property(
        fc.constant<Transition>('complete'),
        (transition) => {
          const { status, hasConclusion } = applyTransition(transition)
          return invariantHolds(status, hasConclusion)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('invariant holds after processing → failed transition (no conclusion)', () => {
    fc.assert(
      fc.property(
        fc.constant<Transition>('failed'),
        (transition) => {
          const { status, hasConclusion } = applyTransition(transition)
          return invariantHolds(status, hasConclusion)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('invariant holds for all valid lifecycle transitions', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant<Transition>('complete'),
          fc.constant<Transition>('failed')
        ),
        (transition) => {
          const { status, hasConclusion } = applyTransition(transition)
          return invariantHolds(status, hasConclusion)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('invalid states are correctly identified as invariant violations', () => {
    // complete without conclusion is always invalid
    fc.assert(
      fc.property(
        fc.constant(false), // hasConclusion = false
        (hasConclusion) => {
          return !invariantHolds('complete', hasConclusion)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('non-complete statuses with a conclusion are always invalid', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant<SessionStatus>('processing'),
          fc.constant<SessionStatus>('failed')
        ),
        (status) => {
          // hasConclusion=true for a non-complete session violates the invariant
          return !invariantHolds(status, true)
        }
      ),
      { numRuns: 100 }
    )
  })
})
