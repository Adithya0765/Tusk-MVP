import Stripe from 'stripe'

// NOTE: Before using this, create two products in the Stripe dashboard:
//   - Starter: ₹299/month → record the Price ID as STRIPE_STARTER_PRICE_ID in .env.local
//   - Pro:     ₹799/month → record the Price ID as STRIPE_PRO_PRICE_ID in .env.local
// This is a manual step that must be done in the Stripe dashboard.

function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('Missing STRIPE_SECRET_KEY')
  return new Stripe(key, { apiVersion: '2025-03-31.basil' })
}

export async function createCheckoutSession(
  userId: string,
  tier: 'starter' | 'pro',
  returnUrl: string
): Promise<string> {
  const stripe = getStripeClient()

  // Price IDs are set in .env.local after creating products in the Stripe dashboard
  const priceId = tier === 'starter'
    ? process.env.STRIPE_STARTER_PRICE_ID
    : process.env.STRIPE_PRO_PRICE_ID

  if (!priceId) {
    throw new Error(`Missing Stripe price ID for tier: ${tier}. Set STRIPE_${tier.toUpperCase()}_PRICE_ID in .env.local`)
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    currency: 'inr',
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: userId, // used by the webhook to identify the user
    metadata: { tier },           // used by the webhook to identify the tier
    success_url: `${returnUrl}?upgraded=true`,
    cancel_url: `${returnUrl}?cancelled=true`,
  })

  if (!session.url) throw new Error('Stripe did not return a checkout URL')
  return session.url
}

export function constructStripeEvent(
  body: string,
  sig: string
): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) throw new Error('Missing STRIPE_WEBHOOK_SECRET')

  const stripe = getStripeClient()
  return stripe.webhooks.constructEvent(body, sig, secret)
}
