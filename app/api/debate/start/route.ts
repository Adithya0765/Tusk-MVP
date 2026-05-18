import { NextResponse } from 'next/server'
import { waitUntil } from '@vercel/functions'
import { runDebateAndPersist } from '@/lib/debate-engine'
import { sanitizeTopic } from '@/lib/validate-topic'
import { DEBATE_LIMITS, TIER_CONFIG } from '@/types'
import { DEV_USER_ID, createSession, countProcessing } from '@/lib/dev-store'

export const maxDuration = 60

export async function POST(req: Request) {
  const body = await req.json()
  const topic: string = sanitizeTopic(body.topic ?? '')
  const mode = body.mode === 'analysis' ? 'analysis' : 'debate'

  if (!topic.trim()) {
    return NextResponse.json({ error: 'TOPIC_EMPTY' }, { status: 422 })
  }
  if (topic.length > DEBATE_LIMITS.MAX_TOPIC_LENGTH) {
    return NextResponse.json({ error: 'TOPIC_TOO_LONG' }, { status: 422 })
  }

  if (countProcessing(DEV_USER_ID) >= DEBATE_LIMITS.MAX_CONCURRENT_DEBATES) {
    return NextResponse.json({ error: 'CONCURRENCY_LIMIT' }, { status: 422 })
  }

  const rounds = TIER_CONFIG['free'].rounds
  const sessionId = crypto.randomUUID()
  const shareSlug = crypto.randomUUID().replace(/-/g, '')

  createSession({
    id: sessionId,
    user_id: DEV_USER_ID,
    topic,
    mode,
    status: 'processing',
    rounds,
    share_slug: shareSlug,
    error_msg: null,
  })

  console.log(`[api/debate/start] Session created: ${sessionId} | mode: ${mode}`)

  // waitUntil keeps the background work alive after the response is sent on Vercel
  waitUntil(
    runDebateAndPersist(sessionId, DEV_USER_ID, topic, rounds, '', false, mode)
      .catch(err => console.error('[debate/start] runDebateAndPersist error:', err))
  )

  return NextResponse.json({ sessionId }, { status: 201 })
}
