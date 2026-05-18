import { describe, it } from 'vitest'
import * as fc from 'fast-check'
import { validateTopicClient, validateTopicServer } from '@/lib/validate-topic'

/**
 * Property 1: Topic length validation is symmetric
 * Validates: Requirements 3.3, 11.4
 */
describe('Property 1: Topic length validation is symmetric', () => {
  it('validateTopicClient and validateTopicServer agree on all strings of length 0–1000', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 1000 }),
        (s) => {
          return validateTopicClient(s) === validateTopicServer(s)
        }
      ),
      { numRuns: 100 }
    )
  })
})
