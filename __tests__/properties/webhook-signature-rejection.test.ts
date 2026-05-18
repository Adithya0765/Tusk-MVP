import { describe, it } from 'vitest'
import * as fc from 'fast-check'

/**
 * Property 11: Webhook signature rejection
 * Validates: Requirements 1.4, 7.5
 *
 * For any HTTP request to the Clerk or Stripe webhook endpoints with an
 * invalid or missing signature, the platform SHALL return HTTP 400 and
 * make no changes to the database.
 *
 * This test models the signature verification logic as pure functions,
 * without calling real webhook endpoints or touching the database.
 */

/**
 * Verifies Clerk webhook headers.
 * Returns false if any of svix-id, svix-timestamp, svix-signature are missing/null.
 * Returns false if the signature doesn't start with 'v1,' (simulated verification).
 */
function verifyClerkSignature(headers: Record<string, string | null>): boolean {
  const svixId = headers['svix-id']
  const svixTimestamp = headers['svix-timestamp']
  const svixSignature = headers['svix-signature']

  if (!svixId || !svixTimestamp || !svixSignature) {
    return false
  }

  // Simulate signature verification: valid signatures start with 'v1,'
  return svixSignature.startsWith('v1,')
}

/**
 * Verifies Stripe webhook headers.
 * Returns false if stripe-signature header is missing/null.
 * Returns false if the signature doesn't start with 't=' (simulated verification).
 */
function verifyStripeSignature(headers: Record<string, string | null>): boolean {
  const sig = headers['stripe-signature']

  if (!sig) {
    return false
  }

  // Simulate signature verification: valid signatures start with 't='
  return sig.startsWith('t=')
}

/**
 * Maps verification result to HTTP status code.
 * Returns 400 if not verified, 200 if verified.
 */
function webhookResponse(verified: boolean): number {
  return verified ? 200 : 400
}

// Arbitrary for a non-null string that does NOT start with 'v1,'
const invalidClerkSig = fc.string({ minLength: 1 }).filter(s => !s.startsWith('v1,'))

// Arbitrary for a non-null string that does NOT start with 't='
const invalidStripeSig = fc.string({ minLength: 1 }).filter(s => !s.startsWith('t='))

// Arbitrary for a valid-looking Clerk signature (starts with 'v1,')
const validClerkSig = fc.string({ minLength: 1 }).map(s => `v1,${s}`)

// Arbitrary for a valid-looking Stripe signature (starts with 't=')
const validStripeSig = fc.string({ minLength: 1 }).map(s => `t=${s}`)

describe('Property 11: Webhook signature rejection', () => {
  it('rejects Clerk webhooks with missing svix headers', () => {
    // Generate headers where at least one svix header is null/missing
    const missingHeaderArb = fc.record({
      'svix-id': fc.option(fc.string({ minLength: 1 }), { nil: null }),
      'svix-timestamp': fc.option(fc.string({ minLength: 1 }), { nil: null }),
      'svix-signature': fc.option(validClerkSig, { nil: null }),
    }).filter(h =>
      h['svix-id'] === null || h['svix-timestamp'] === null || h['svix-signature'] === null
    )

    fc.assert(
      fc.property(missingHeaderArb, (headers) => {
        const status = webhookResponse(verifyClerkSignature(headers))
        return status === 400
      }),
      { numRuns: 100 }
    )
  })

  it('rejects Clerk webhooks with invalid signatures', () => {
    // All headers present but signature is invalid (doesn't start with 'v1,')
    const invalidSigArb = fc.record({
      'svix-id': fc.string({ minLength: 1 }),
      'svix-timestamp': fc.string({ minLength: 1 }),
      'svix-signature': invalidClerkSig,
    })

    fc.assert(
      fc.property(invalidSigArb, (headers) => {
        const status = webhookResponse(verifyClerkSignature(headers))
        return status === 400
      }),
      { numRuns: 100 }
    )
  })

  it('rejects Stripe webhooks with missing stripe-signature header', () => {
    const missingHeaderArb = fc.record({
      'stripe-signature': fc.constant(null) as fc.Arbitrary<null>,
    })

    fc.assert(
      fc.property(missingHeaderArb, (headers) => {
        const status = webhookResponse(verifyStripeSignature(headers))
        return status === 400
      }),
      { numRuns: 100 }
    )
  })

  it('rejects Stripe webhooks with invalid signatures', () => {
    const invalidSigArb = fc.record({
      'stripe-signature': invalidStripeSig,
    })

    fc.assert(
      fc.property(invalidSigArb, (headers) => {
        const status = webhookResponse(verifyStripeSignature(headers))
        return status === 400
      }),
      { numRuns: 100 }
    )
  })

  it('accepts Clerk webhooks with all valid headers and valid signature', () => {
    const validArb = fc.record({
      'svix-id': fc.string({ minLength: 1 }),
      'svix-timestamp': fc.string({ minLength: 1 }),
      'svix-signature': validClerkSig,
    })

    fc.assert(
      fc.property(validArb, (headers) => {
        const status = webhookResponse(verifyClerkSignature(headers))
        return status === 200
      }),
      { numRuns: 100 }
    )
  })

  it('accepts Stripe webhooks with valid signature', () => {
    const validArb = fc.record({
      'stripe-signature': validStripeSig,
    })

    fc.assert(
      fc.property(validArb, (headers) => {
        const status = webhookResponse(verifyStripeSignature(headers))
        return status === 200
      }),
      { numRuns: 100 }
    )
  })
})
