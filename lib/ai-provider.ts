/**
 * AI Provider — routes calls to the correct backend based on the selected ModelConfig.
 * Free tier: Cerebras (fast, cheap)
 * Paid tiers: OpenRouter (premium models)
 */

import { callCerebrasA, callCerebrasB, callCerebrasConclusion } from './cerebras'
import { callOpenRouterModel } from './openrouter'
import type { ModelConfig } from '@/types'

export async function callAgentA(
  systemPrompt: string,
  userMessage: string,
  model?: ModelConfig
): Promise<string> {
  if (model?.backend === 'openrouter') {
    return callOpenRouterModel(model.agentAModel, systemPrompt, userMessage)
  }
  return callCerebrasA(systemPrompt, userMessage)
}

export async function callAgentB(
  systemPrompt: string,
  userMessage: string,
  model?: ModelConfig
): Promise<string> {
  if (model?.backend === 'openrouter') {
    return callOpenRouterModel(model.agentBModel, systemPrompt, userMessage)
  }
  return callCerebrasB(systemPrompt, userMessage)
}

export async function callConclusion(
  systemPrompt: string,
  userMessage: string,
  model?: ModelConfig
): Promise<string> {
  if (model?.backend === 'openrouter') {
    // Use agent A model for conclusion — it's the stronger one
    return callOpenRouterModel(model.agentAModel, systemPrompt, userMessage)
  }
  return callCerebrasConclusion(systemPrompt, userMessage)
}

export function getAgentNames(model?: ModelConfig): { agentA: string; agentB: string } {
  if (model?.backend === 'openrouter') {
    // Extract readable names from model IDs like "anthropic/claude-sonnet-4-5"
    const nameA = model.agentAModel.split('/').pop()?.replace(/-/g, ' ') ?? 'Agent A'
    const nameB = model.agentBModel.split('/').pop()?.replace(/-/g, ' ') ?? 'Agent B'
    return {
      agentA: nameA.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      agentB: nameB.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    }
  }
  return { agentA: 'Qwen 3', agentB: 'Llama 3.1' }
}
