/**
 * AI Provider — Cerebras only.
 * All agents and conclusion calls go through Cerebras.
 */

import { callCerebrasA, callCerebrasB, callCerebrasConclusion } from './cerebras'

export async function callAgentA(systemPrompt: string, userMessage: string): Promise<string> {
  return callCerebrasA(systemPrompt, userMessage)
}

export async function callAgentB(systemPrompt: string, userMessage: string): Promise<string> {
  return callCerebrasB(systemPrompt, userMessage)
}

export async function callConclusion(systemPrompt: string, userMessage: string): Promise<string> {
  return callCerebrasConclusion(systemPrompt, userMessage)
}

export function getAgentNames() {
  return { agentA: 'Qwen 3', agentB: 'Llama 3.1' }
}
