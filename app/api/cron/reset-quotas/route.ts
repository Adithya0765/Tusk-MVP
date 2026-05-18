import { NextResponse } from 'next/server'

// Dev mode: cron disabled
export async function GET() {
  return NextResponse.json({ message: 'Cron disabled in dev mode' }, { status: 200 })
}
