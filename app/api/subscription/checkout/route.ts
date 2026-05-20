import { NextResponse } from 'next/server'
import { TIER_CONFIG, type Tier } from '@/types'

export async function POST(req: Request) {
  const body = await req.json()
  const tier = body.tier as Tier

  if (!tier || tier === 'free') {
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
  }

  const config = TIER_CONFIG[tier]
  const checkoutUrl = config?.lemonSqueezyUrl

  if (!checkoutUrl) {
    return NextResponse.json(
      { error: 'Payments not configured yet. Set NEXT_PUBLIC_LS_URL_COMMUNITY or NEXT_PUBLIC_LS_URL_PRO in your environment.' },
      { status: 503 }
    )
  }

  // Lemon Squeezy hosted checkout — just redirect, no API call needed
  return NextResponse.json({ url: checkoutUrl })
}
