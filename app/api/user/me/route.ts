import { NextResponse } from 'next/server'
import { DEV_USER_ID, listSessions } from '@/lib/dev-store'

// Dev stub — returns a fake user, no Clerk/Supabase needed
const DEV_USER = {
  id: DEV_USER_ID,
  email: 'dev@tusk.local',
  display_name: 'Dev User',
  tier: 'free',
  quota_used: 0,
  quota_limit: 3,
  quota_reset_at: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 1)).toISOString(),
  notify_email: false,
  created_at: new Date().toISOString(),
}

export async function GET() {
  const sessions = listSessions(DEV_USER_ID)
  const used = sessions.filter(s => s.status === 'complete').length
  return NextResponse.json({ ...DEV_USER, quota_used: used })
}

export async function PATCH(req: Request) {
  const body = await req.json()
  // Accept but ignore in dev mode
  return NextResponse.json({ ...DEV_USER, ...body })
}
