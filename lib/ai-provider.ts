/**
 * AI Provider router
 *
 * Active:   grok  (Groq — llama-3.3-70b FOR, llama-3.1-8b AGAINST)
 * Standby:  gemini     (set ACTIVE_PROVIDER=gemini)
 * Standby:  openrouter (set ACTIVE_PROVIDER=openrouter)
 * Standby:  claude     (set ACTIVE_PROVIDER=claude + CLAUDE_ENABLED=true)
 *
 * UI labels stay as "Gemini" / "Grok" regardless of active provider.
 */

import { callGrok, callGrokB, callGrokConclusion } from './grok'
import { callGemini } from './gemini'
import { callOpenRouterA, callOpenRouterB, callOpenRouterConclusion } from './openrouter'

const PROVIDER = (process.env.ACTIVE_PROVIDER ?? 'grok').toLowerCase()

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

// ── Agent A — FOR side ────────────────────────────────────────────────────────
export async function callAgentA(systemPrompt: string, userMessage: string): Promise<string> {
  if (PROVIDER === 'gemini')     return callGemini(systemPrompt, userMessage)
  if (PROVIDER === 'openrouter') return callOpenRouterA(systemPrompt, userMessage)
  if (claudeEnabled)             return callClaude(systemPrompt, userMessage)
  // default: grok (llama-3.3-70b)
  return callGrok(systemPrompt, userMessage)
}

// ── Agent B — AGAINST side ────────────────────────────────────────────────────
export async function callAgentB(systemPrompt: string, userMessage: string): Promise<string> {
  if (PROVIDER === 'gemini')     return callGemini(systemPrompt, userMessage)
  if (PROVIDER === 'openrouter') return callOpenRouterB(systemPrompt, userMessage)
  if (claudeEnabled)             return callClaude(systemPrompt, userMessage)
  // default: grok (llama-3.1-8b — faster, different voice)
  return callGrokB(systemPrompt, userMessage)
}

// ── Conclusion synthesizer ────────────────────────────────────────────────────
export async function callConclusion(systemPrompt: string, userMessage: string): Promise<string> {
  if (PROVIDER === 'gemini')     return callGemini(systemPrompt, userMessage)
  if (PROVIDER === 'openrouter') return callOpenRouterConclusion(systemPrompt, userMessage)
  if (claudeEnabled)             return callClaude(systemPrompt, userMessage)
  // default: grok (llama-3.3-70b for structured JSON output)
  return callGrokConclusion(systemPrompt, userMessage)
}

// ── UI labels — always show Gemini / Grok regardless of active provider ───────
export function getAgentNames() {
  return {
    agentA: 'Gemini',
    agentB: 'Grok',
  }
}
