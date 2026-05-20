import { NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * Lemon Squeezy webhook handler.
 *
 * Events handled:
 *   subscription_created  — user subscribed, grant tier access
 *   subscription_updated  — plan changed or renewed
 *   subscription_cancelled — subscription ended, downgrade to free
 *
 * Setup in LS dashboard:
 *   Webhooks → Add webhook → URL: https://yourdomain.com/api/webhooks/lemonsqueezy
 *   Secret: set LEMONSQUEEZY_WEBHOOK_SECRET in your env vars
 *
 * NOTE: This is a stub that logs events. Wire up your DB/user store here
 * when you're ready to automatically grant/revoke tier access.
 */

function verifySignature(body: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(body).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
}

export async function POST(req: Request) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET

  const rawBody = await req.text()
  const signature = req.headers.get('x-signature') ?? ''

  // Verify signature if secret is configured
  if (secret) {
    if (!signature || !verifySignature(rawBody, signature, secret)) {
      console.error('[ls-webhook] Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  }

  let event: Record<string, unknown>
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventName = event.meta && typeof event.meta === 'object'
    ? (event.meta as Record<string, unknown>).event_name as string
    : null

  console.log(`[ls-webhook] Event: ${eventName}`)

  // TODO: when you have a real user DB, update the user's tier here based on
  // the custom_data.user_id you pass in the checkout URL (append ?checkout[custom][user_id]=USER_ID)
  switch (eventName) {
    case 'subscription_created':
    case 'subscription_updated':
      // Grant paid tier access
      console.log('[ls-webhook] Subscription active — grant tier access')
      break
    case 'subscription_cancelled':
    case 'subscription_expired':
      // Downgrade to free
      console.log('[ls-webhook] Subscription ended — downgrade to free')
      break
    default:
      console.log(`[ls-webhook] Unhandled event: ${eventName}`)
  }

  return NextResponse.json({ received: true })
}
