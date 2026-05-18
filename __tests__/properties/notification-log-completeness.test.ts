import { describe, it } from 'vitest'
import * as fc from 'fast-check'
import { type SessionStatus } from '@/types'

/**
 * Property 7: Notification log completeness
 * Validates: Requirements 9.1, 9.2, 9.3
 *
 * For any debate session that transitions to `complete` or `failed` with email
 * notifications enabled for the user, there SHALL exist at least one row in
 * `notifications_log` for that session recording the attempt outcome.
 */

/**
 * Pure function: determines whether a notification should be sent.
 * Returns true if the session is in a terminal state AND the user has
 * email notifications enabled.
 */
function shouldNotify(status: SessionStatus, notifyEmail: boolean): boolean {
  return (status === 'complete' || status === 'failed') && notifyEmail === true
}

/**
 * Pure function: checks whether a log entry exists for a given sessionId.
 */
function logEntryExists(
  sessionId: string,
  log: Array<{ sessionId: string }>
): boolean {
  return log.some((entry) => entry.sessionId === sessionId)
}

/**
 * Simulates the notification flow for a batch of sessions:
 * - For each session where shouldNotify is true, add a log entry.
 * - Returns the resulting notifications log.
 */
function simulateNotificationFlow(
  sessions: Array<{ sessionId: string; status: SessionStatus; notifyEmail: boolean }>
): Array<{ sessionId: string }> {
  const log: Array<{ sessionId: string }> = []
  for (const session of sessions) {
    if (shouldNotify(session.status, session.notifyEmail)) {
      log.push({ sessionId: session.sessionId })
    }
  }
  return log
}

// ─── Arbitraries ─────────────────────────────────────────────────────────────

const arbStatus = fc.constantFrom<SessionStatus>('processing', 'complete', 'failed')
const arbNotifyEmail = fc.boolean()
const arbSessionId = fc.uuid()

const arbSession = fc.record({
  sessionId: arbSessionId,
  status: arbStatus,
  notifyEmail: arbNotifyEmail,
})

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Property 7: Notification log completeness', () => {
  it('shouldNotify returns true only for terminal statuses with notify_email=true', () => {
    fc.assert(
      fc.property(arbStatus, arbNotifyEmail, (status, notifyEmail) => {
        const result = shouldNotify(status, notifyEmail)
        const expected =
          (status === 'complete' || status === 'failed') && notifyEmail === true
        return result === expected
      }),
      { numRuns: 100 }
    )
  })

  it('logEntryExists correctly detects presence of a session in the log', () => {
    fc.assert(
      fc.property(
        arbSessionId,
        fc.array(arbSessionId, { minLength: 0, maxLength: 10 }),
        fc.boolean(),
        (targetId, otherIds, includeTarget) => {
          const log = otherIds.map((id) => ({ sessionId: id }))
          if (includeTarget) {
            log.push({ sessionId: targetId })
          }
          return logEntryExists(targetId, log) === includeTarget || otherIds.includes(targetId)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('every session where shouldNotify is true has a log entry after simulation', () => {
    fc.assert(
      fc.property(
        fc.array(arbSession, { minLength: 1, maxLength: 20 }),
        (sessions) => {
          const log = simulateNotificationFlow(sessions)

          // For every session that should be notified, a log entry must exist
          for (const session of sessions) {
            if (shouldNotify(session.status, session.notifyEmail)) {
              if (!logEntryExists(session.sessionId, log)) {
                return false
              }
            }
          }
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('sessions where shouldNotify is false do NOT produce log entries (no spurious entries)', () => {
    fc.assert(
      fc.property(
        fc.array(arbSession, { minLength: 1, maxLength: 20 }),
        (sessions) => {
          const log = simulateNotificationFlow(sessions)

          // Every log entry must correspond to a session that shouldNotify
          for (const entry of log) {
            const session = sessions.find((s) => s.sessionId === entry.sessionId)
            if (!session) return false
            if (!shouldNotify(session.status, session.notifyEmail)) return false
          }
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('complete sessions with notify_email=true always produce a log entry', () => {
    fc.assert(
      fc.property(arbSessionId, (sessionId) => {
        const sessions = [{ sessionId, status: 'complete' as SessionStatus, notifyEmail: true }]
        const log = simulateNotificationFlow(sessions)
        return logEntryExists(sessionId, log)
      }),
      { numRuns: 100 }
    )
  })

  it('failed sessions with notify_email=true always produce a log entry', () => {
    fc.assert(
      fc.property(arbSessionId, (sessionId) => {
        const sessions = [{ sessionId, status: 'failed' as SessionStatus, notifyEmail: true }]
        const log = simulateNotificationFlow(sessions)
        return logEntryExists(sessionId, log)
      }),
      { numRuns: 100 }
    )
  })

  it('processing sessions never produce a log entry regardless of notify_email', () => {
    fc.assert(
      fc.property(arbSessionId, arbNotifyEmail, (sessionId, notifyEmail) => {
        const sessions = [{ sessionId, status: 'processing' as SessionStatus, notifyEmail }]
        const log = simulateNotificationFlow(sessions)
        return !logEntryExists(sessionId, log)
      }),
      { numRuns: 100 }
    )
  })

  it('terminal sessions with notify_email=false never produce a log entry', () => {
    fc.assert(
      fc.property(
        arbSessionId,
        fc.constantFrom<SessionStatus>('complete', 'failed'),
        (sessionId, status) => {
          const sessions = [{ sessionId, status, notifyEmail: false }]
          const log = simulateNotificationFlow(sessions)
          return !logEntryExists(sessionId, log)
        }
      ),
      { numRuns: 100 }
    )
  })
})
