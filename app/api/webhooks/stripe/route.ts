import { NextResponse } from 'next/server'

// Dev mode: Stripe webhooks disabled
export async function POST() {
  return NextResponse.json({ message: 'Stripe webhooks disabled in dev mode' }, { status: 200 })
}
