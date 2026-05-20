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

// ─── Model Catalogue ─────────────────────────────────────────────────────────

export type ModelId =
  | 'qwen3-cerebras'
  | 'llama31-cerebras'
  | 'llama33-openrouter'
  | 'mistral-openrouter'
  | 'claude-haiku-openrouter'
  | 'gpt4o-mini-openrouter'
  | 'claude-sonnet-openrouter'
  | 'gpt4o-openrouter'

export interface ModelConfig {
  id: ModelId
  label: string           // display name
  provider: string        // shown in UI
  description: string     // one-line capability summary
  tier: Tier              // minimum tier required
  agentAModel: string     // provider-specific model ID for agent A
  agentBModel: string     // provider-specific model ID for agent B
  backend: 'cerebras' | 'openrouter'
}

export const MODEL_CATALOGUE: ModelConfig[] = [
  {
    id: 'qwen3-cerebras',
    label: 'Qwen 3 vs Llama 3.1',
    provider: 'Cerebras',
    description: 'Ultra-fast inference. Great for quick debates.',
    tier: 'free',
    agentAModel: 'qwen-3-235b-a22b-instruct-2507',
    agentBModel: 'llama3.1-8b',
    backend: 'cerebras',
  },
  {
    id: 'llama33-openrouter',
    label: 'Llama 3.3 70B vs Mistral',
    provider: 'OpenRouter',
    description: 'Stronger reasoning. Better structured arguments.',
    tier: 'starter',
    agentAModel: 'meta-llama/llama-3.3-70b-instruct',
    agentBModel: 'mistralai/mistral-7b-instruct',
    backend: 'openrouter',
  },
  {
    id: 'mistral-openrouter',
    label: 'Mistral Large vs Llama 3.3',
    provider: 'OpenRouter',
    description: 'European AI powerhouse. Sharp, concise analysis.',
    tier: 'starter',
    agentAModel: 'mistralai/mistral-large',
    agentBModel: 'meta-llama/llama-3.3-70b-instruct',
    backend: 'openrouter',
  },
  {
    id: 'claude-haiku-openrouter',
    label: 'Claude Haiku vs GPT-4o Mini',
    provider: 'OpenRouter',
    description: 'Fast premium models. Nuanced, well-structured output.',
    tier: 'starter',
    agentAModel: 'anthropic/claude-haiku-4-5',
    agentBModel: 'openai/gpt-4o-mini',
    backend: 'openrouter',
  },
  {
    id: 'gpt4o-mini-openrouter',
    label: 'GPT-4o Mini vs Claude Haiku',
    provider: 'OpenRouter',
    description: 'OpenAI vs Anthropic. Two top-tier perspectives.',
    tier: 'starter',
    agentAModel: 'openai/gpt-4o-mini',
    agentBModel: 'anthropic/claude-haiku-4-5',
    backend: 'openrouter',
  },
  {
    id: 'claude-sonnet-openrouter',
    label: 'Claude Sonnet vs GPT-4o',
    provider: 'OpenRouter',
    description: 'Frontier models. Deepest reasoning and analysis.',
    tier: 'pro',
    agentAModel: 'anthropic/claude-sonnet-4-5',
    agentBModel: 'openai/gpt-4o',
    backend: 'openrouter',
  },
  {
    id: 'gpt4o-openrouter',
    label: 'GPT-4o vs Claude Sonnet',
    provider: 'OpenRouter',
    description: 'OpenAI flagship vs Anthropic flagship.',
    tier: 'pro',
    agentAModel: 'openai/gpt-4o',
    agentBModel: 'anthropic/claude-sonnet-4-5',
    backend: 'openrouter',
  },
]

export function getModelsForTier(tier: Tier): ModelConfig[] {
  const order: Tier[] = ['free', 'starter', 'pro']
  const tierIndex = order.indexOf(tier)
  return MODEL_CATALOGUE.filter(m => order.indexOf(m.tier) <= tierIndex)
}

export function getModel(id: ModelId): ModelConfig {
  const m = MODEL_CATALOGUE.find(m => m.id === id)
  if (!m) throw new Error(`Unknown model: ${id}`)
  return m
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
