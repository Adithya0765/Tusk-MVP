/**
 * AI Provider router
 *
 * Active:   cerebras (default — llama3.3-70b, extremely fast)
 * Standby:  openrouter (set ACTIVE_PROVIDER=openrouter)
 * Standby:  gemini     (set ACTIVE_PROVIDER=gemini)
 * Standby:  grok       (set ACTIVE_PROVIDER=grok)
 * Standby:  claude     (set ACTIVE_PROVIDER=claude + CLAUDE_ENABLED=true)
 *
 * UI labels: "Agent A" / "Agent B" — provider-agnostic.
 */

import { callCerebrasA, callCerebrasB, callCerebrasConclusion } from './cerebras'
import { callOpenRouterA, callOpenRouterB, callOpenRouterConclusion } from './openrouter'
import { callGemini } from './gemini'
import { callGrok, callGrokB, callGrokConclusion } from './grok'

const PROVIDER = (process.env.ACTIVE_PROVIDER ?? 'cerebras').toLowerCase()

const claudeEnabled =
  PROVIDER === 'claude' &&
  process.env.CLAUDE_ENABLED === 'true' &&
  !!process.env.ANTHROPIC_API_KEY

async function callClaude(systemPrompt: string, userMessage: string): Promise<string> {
  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 500,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })
  return (msg.content[0] as { text: string }).text
}

// ── Agent A ─────────────────────────────────────────────────────────────────
export async function callAgentA(systemPrompt: string, userMessage: string): Promise<string> {
  if (PROVIDER === 'openrouter') return callOpenRouterA(systemPrompt, userMessage)
  if (PROVIDER === 'gemini')     return callGemini(systemPrompt, userMessage)
  if (PROVIDER === 'grok')       return callGrok(systemPrompt, userMessage)
  if (claudeEnabled)             return callClaude(systemPrompt, userMessage)
  // default: cerebras
  return callCerebrasA(systemPrompt, userMessage)
}

// ── Agent B ─────────────────────────────────────────────────────────────────
export async function callAgentB(systemPrompt: string, userMessage: string): Promise<string> {
  if (PROVIDER === 'openrouter') return callOpenRouterB(systemPrompt, userMessage)
  if (PROVIDER === 'gemini')     return callGemini(systemPrompt, userMessage)
  if (PROVIDER === 'grok')       return callGrokB(systemPrompt, userMessage)
  if (claudeEnabled)             return callClaude(systemPrompt, userMessage)
  // default: cerebras
  return callCerebrasB(systemPrompt, userMessage)
}

// ── Conclusion ──────────────────────────────────────────────────────────────
export async function callConclusion(systemPrompt: string, userMessage: string): Promise<string> {
  if (PROVIDER === 'openrouter') return callOpenRouterConclusion(systemPrompt, userMessage)
  if (PROVIDER === 'gemini')     return callGemini(systemPrompt, userMessage)
  if (PROVIDER === 'grok')       return callGrokConclusion(systemPrompt, userMessage)
  if (claudeEnabled)             return callClaude(systemPrompt, userMessage)
  // default: cerebras
  return callCerebrasConclusion(systemPrompt, userMessage)
}

// ── UI labels ───────────────────────────────────────────────────────────────
export function getAgentNames() {
  if (PROVIDER === 'cerebras') {
    return { agentA: 'Qwen 3', agentB: 'Llama 3.1' }
  }
  return { agentA: 'Agent A', agentB: 'Agent B' }
}
