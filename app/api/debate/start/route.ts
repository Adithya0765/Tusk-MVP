import { NextResponse } from 'next/server'
import { waitUntil } from '@vercel/functions'
import { runDebateAndPersist } from '@/lib/debate-engine'
import { sanitizeTopic } from '@/lib/validate-topic'
import { DEBATE_LIMITS, TIER_CONFIG, MODEL_CATALOGUE, getModel, type ModelId, type Tier } from '@/types'
import { DEV_USER_ID, createSession, countProcessing } from '@/lib/dev-store'

export const maxDuration = 60

// In MVP mode the user tier comes from the request body.
// When auth is wired, replace this with the real user tier from the DB.
const DEV_TIER: Tier = 'free'

export async function POST(req: Request) {
  const body = await req.json()
  const topic: string = sanitizeTopic(body.topic ?? '')
  const mode = body.mode === 'analysis' ? 'analysis' : 'debate'
  const requestedModelId = body.modelId as ModelId | undefined

  if (!topic.trim()) {
    return NextResponse.json({ error: 'TOPIC_EMPTY' }, { status: 422 })
  }
  if (topic.length > DEBATE_LIMITS.MAX_TOPIC_LENGTH) {
    return NextResponse.json({ error: 'TOPIC_TOO_LONG' }, { status: 422 })
  }

  if (countProcessing(DEV_USER_ID) >= DEBATE_LIMITS.MAX_CONCURRENT_DEBATES) {
    return NextResponse.json({ error: 'CONCURRENCY_LIMIT' }, { status: 422 })
  }

  // Resolve model — default to free tier model if none requested
  const tierOrder: Tier[] = ['free', 'starter', 'pro']
  const userTierIndex = tierOrder.indexOf(DEV_TIER)

  let selectedModel = MODEL_CATALOGUE.find(m => m.tier === 'free')! // default

  if (requestedModelId) {
    try {
      const requested = getModel(requestedModelId)
      const requiredTierIndex = tierOrder.indexOf(requested.tier)
      if (requiredTierIndex > userTierIndex) {
        return NextResponse.json({ error: 'MODEL_TIER_REQUIRED', requiredTier: requested.tier }, { status: 403 })
      }
      selectedModel = requested
    } catch {
      return NextResponse.json({ error: 'INVALID_MODEL' }, { status: 400 })
    }
  }

  const rounds = TIER_CONFIG[DEV_TIER].rounds
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

  waitUntil(
    runDebateAndPersist(sessionId, DEV_USER_ID, topic, rounds, '', false, mode, selectedModel)
      .catch(() => {/* errors handled inside runDebateAndPersist */})
  )

  return NextResponse.json({ sessionId, modelId: selectedModel.id }, { status: 201 })
}
