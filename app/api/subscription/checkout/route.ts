import { NextResponse } from 'next/server'

// Dev mode: Stripe checkout disabled
export async function POST() {
  return NextResponse.json({ message: 'Payments disabled in dev mode' }, { status: 503 })
}
