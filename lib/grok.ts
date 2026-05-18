import { getGrokKey, markKeyRateLimited } from './key-manager'

/**
 * Groq inference — OpenAI-compatible API, very fast.
 *
 * Agent A (FOR)     → llama-3.3-70b-versatile  (larger, more authoritative)
 * Agent B (AGAINST) → llama-3.1-8b-instant     (faster, punchy counter-arguments)
 * Conclusion        → llama-3.3-70b-versatile  (needs structured JSON output)
 *
 * Keys starting with gsk_ are Groq keys.
 * Keys starting with xai- are xAI Grok keys (standby).
 */

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions'
const XAI_ENDPOINT  = 'https://api.x.ai/v1/chat/completions'

export type GroqAgent = 'A' | 'B' | 'conclusion'

function modelForAgent(agent: GroqAgent, isGroq: boolean): string {
  if (!isGroq) return 'grok-3-mini'  // xAI fallback — same model for all
  switch (agent) {
    case 'A':          return 'llama-3.3-70b-versatile'
    case 'B':          return 'llama-3.1-8b-instant'
    case 'conclusion': return 'llama-3.3-70b-versatile'
  }
}

async function callGroqAgent(
  agent: GroqAgent,
  systemPrompt: string,
  userMessage: string,
  retries = 3
): Promise<string> {
  if (retries === 0) throw new Error('Groq failed after all retries.')

  const key = getGrokKey()
  const isGroq = key.startsWith('gsk_')
  const endpoint = isGroq ? GROQ_ENDPOINT : XAI_ENDPOINT
  const model = modelForAgent(agent, isGroq)

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userMessage  },
        ],
        max_tokens: 500,
        temperature: 0.8,
      }),
    })

    if (response.status === 429) {
      markKeyRateLimited(key, 'grok')
      if (retries > 1) {
        await new Promise(r => setTimeout(r, 1000))
        return callGroqAgent(agent, systemPrompt, userMessage, retries - 1)
      }
      throw new Error('All Groq keys rate limited.')
    }

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      const isTransient = response.status >= 500
      if (isTransient && retries > 1) {
        await new Promise(r => setTimeout(r, 800))
        return callGroqAgent(agent, systemPrompt, userMessage, retries - 1)
      }
      throw new Error(`Groq error ${response.status}: ${body}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new Error('Groq returned empty content')
    return content

  } catch (err: any) {
    const isTransient =
      err?.code === 'ECONNRESET' ||
      err?.code === 'ETIMEDOUT' ||
      err?.message?.includes('fetch')
    if (isTransient && retries > 1) {
      await new Promise(r => setTimeout(r, 800))
      return callGroqAgent(agent, systemPrompt, userMessage, retries - 1)
    }
    throw err
  }
}

// Named exports used by ai-provider.ts
export const callGrok        = (s: string, u: string) => callGroqAgent('A',          s, u)
export const callGrokB       = (s: string, u: string) => callGroqAgent('B',          s, u)
export const callGrokConclusion = (s: string, u: string) => callGroqAgent('conclusion', s, u)
