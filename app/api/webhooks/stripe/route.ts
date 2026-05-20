import { NextResponse } from 'next/server'

// Stripe not used — payments handled via Lemon Squeezy
export async function POST() {
  return NextResponse.json({ message: 'Not used' }, { status: 200 })
}
