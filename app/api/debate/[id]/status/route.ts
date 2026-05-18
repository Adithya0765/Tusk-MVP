import { NextResponse } from 'next/server'
import { getSession, getTurns, getConclusion } from '@/lib/dev-store'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = getSession(id)

  if (!session) {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  }

  if (session.status !== 'complete') {
    return NextResponse.json({ status: session.status })
  }

  const turns = getTurns(id)
  const row = getConclusion(id)

  let conclusion = null
  if (row) {
    try { conclusion = JSON.parse(row.content) }
    catch { conclusion = row.content }
  }

  return NextResponse.json({
    status: session.status,
    shareSlug: session.share_slug,
    turns,
    conclusion,
  })
}
