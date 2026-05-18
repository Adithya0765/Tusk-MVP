import { NextResponse } from 'next/server'
import { getAgentNames } from '@/lib/ai-provider'
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

  const turns = getTurns(id)

  let conclusion = null
  if (session.status === 'complete') {
    const row = getConclusion(id)
    if (row) {
      try { conclusion = JSON.parse(row.content) }
      catch { conclusion = row.content }
    }
  }

  return NextResponse.json({
    session,
    turns,
    conclusion,
    agentNames: getAgentNames(),
  })
}
