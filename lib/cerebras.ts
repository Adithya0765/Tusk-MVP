/**
 * Cerebras inference — OpenAI-compatible API, extremely fast.
 * Docs: https://inference-docs.cerebras.ai
 *
 * Agent A: qwen-3-235b-a22b-instruct-2507
 * Agent B: llama3.1-8b
 */

const CEREBRAS_ENDPOINT = 'https://api.cerebras.ai/v1/chat/completions'
const MODEL_A = 'qwen-3-235b-a22b-instruct-2507'
const MODEL_B = 'llama3.1-8b'

function getKey(): string {
  const key = process.env.CEREBRAS_API_KEY
  if (!key) throw new Error('Missing CEREBRAS_API_KEY in environment')
  return key
}

async function callCerebras(
  model: string,
  systemPrompt: string,
  userMessage: string,
  retries = 3
): Promise<string> {
  if (retries === 0) throw new Error('Cerebras failed after all retries.')

  const key = getKey()

  let response: Response
  try {
    response = await fetch(CEREBRAS_ENDPOINT, {
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
        max_tokens: 800,
        temperature: 0.7,
      }),
    })
  } catch (networkErr: any) {
    if (retries > 1) {
      await new Promise(r => setTimeout(r, 1000))
      return callCerebras(model, systemPrompt, userMessage, retries - 1)
    }
    throw networkErr
  }

  if (response.status === 429) {
    if (retries > 1) {
      await new Promise(r => setTimeout(r, 2000))
      return callCerebras(model, systemPrompt, userMessage, retries - 1)
    }
    throw new Error('Cerebras rate limit hit. Try again shortly.')
  }

  if (response.status >= 500) {
    if (retries > 1) {
      await new Promise(r => setTimeout(r, 1000))
      return callCerebras(model, systemPrompt, userMessage, retries - 1)
    }
    throw new Error(`Cerebras server error ${response.status}`)
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Cerebras error ${response.status}: ${body}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Cerebras returned empty content')
  return content.trim()
}

export function callCerebrasA(systemPrompt: string, userMessage: string): Promise<string> {
  return callCerebras(MODEL_A, systemPrompt, userMessage)
}

export function callCerebrasB(systemPrompt: string, userMessage: string): Promise<string> {
  return callCerebras(MODEL_B, systemPrompt, userMessage)
}

export function callCerebrasConclusion(systemPrompt: string, userMessage: string): Promise<string> {
  return callCerebras(MODEL_A, systemPrompt, userMessage)
}
