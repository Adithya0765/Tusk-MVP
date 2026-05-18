import { NextResponse } from 'next/server'

// Dev mode: Clerk webhooks disabled
export async function POST() {
  return NextResponse.json({ message: 'Clerk webhooks disabled in dev mode' }, { status: 200 })
}
