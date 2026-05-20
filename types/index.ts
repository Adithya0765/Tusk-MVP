export interface IconProps extends React.ComponentProps<'svg'> {
    size?: number;
    color?: string;
}

// ─── TUSK MVP Types ───────────────────────────────────────────────────────────

export type Tier = 'free' | 'starter' | 'pro'
export type SessionStatus = 'processing' | 'complete' | 'failed'
export type Agent = 'A' | 'B'
export type NotificationStatus = 'sent' | 'failed'

export interface TierConfig {
  tier: Tier
  label: string
  priceINR: number
  priceUSD: number
  quotaLimit: number
  rounds: number
  stripePriceId?: string
  lemonSqueezyUrl?: string
}

export const TIER_CONFIG: Record<Tier, TierConfig> = {
  free:    { tier: 'free',    label: 'Explorer',  priceINR: 0,   priceUSD: 0,  quotaLimit: 3,   rounds: 3 },
  starter: { tier: 'starter', label: 'Community', priceINR: 349, priceUSD: 4,  quotaLimit: 30,  rounds: 4, lemonSqueezyUrl: process.env.NEXT_PUBLIC_LS_URL_COMMUNITY },
  pro:     { tier: 'pro',     label: 'Pro',        priceINR: 999, priceUSD: 12, quotaLimit: 100, rounds: 6, lemonSqueezyUrl: process.env.NEXT_PUBLIC_LS_URL_PRO },
}

export const DEBATE_LIMITS = {
  MAX_TOKENS_PER_TURN:    300,
  MAX_TURNS_PER_SESSION:  12,
  MAX_TOPIC_LENGTH:       500,
  MAX_CONCURRENT_DEBATES: 3,
  MAX_RETRIES:            3,
} as const

// ─── Database Row Types ───────────────────────────────────────────────────────

export interface DbUser {
  id: string               // Clerk user ID
  email: string
  display_name: string | null
  tier: Tier
  quota_used: number
  quota_limit: number
  quota_reset_at: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  notify_email: boolean
  created_at: string
}

export interface DbSession {
  id: string
  user_id: string
  topic: string
  mode: 'debate' | 'analysis'
  status: SessionStatus
  rounds: number
  error_msg: string | null
  share_slug: string | null
  created_at: string
  updated_at: string
}

export interface DbTurn {
  id: string
  session_id: string
  round_num: number
  agent: Agent
  content: string
  token_count: number | null
  created_at: string
}

export interface DbConclusion {
  id: string
  session_id: string
  content: string          // JSON string
  created_at: string
}

export interface PRDSection {
  problemStatement: string
  targetUsers: string
  coreFeatures: string[]
  successMetrics: string[]
  outOfScope: string[]
  mvpScope: string
}

export interface ConclusionData {
  executiveSummary: string
  keyPointsFor: string[]
  keyPointsAgainst: string[]
  unresolvedTensions: string[]
  finalVerdict: string
  confidenceLevel: 'Low' | 'Medium' | 'High'
  recommendedActions?: string[]
  improvementSuggestions?: string[]
  prd?: PRDSection
}
