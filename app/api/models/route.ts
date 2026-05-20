import { NextResponse } from 'next/server'
import { getModelsForTier, type Tier } from '@/types'

// In MVP mode tier is always free. When auth is wired, read from the user's DB record.
const DEV_TIER: Tier = 'free'

export async function GET() {
  const models = getModelsForTier(DEV_TIER)
  return NextResponse.json({ models, tier: DEV_TIER })
}
