/**
 * OpenRouter provider — single API key, multiple models.
 * Docs: https://openrouter.ai/docs
 *
 * Active models (all free tier):
 *   Agent A (FOR/Builder)      : deepseek/deepseek-v4-flash:free
 *   Agent B (AGAINST/Stress)   : arcee-ai/trinity-large-thinking:free
 *   Conclusion                 : deepseek/deepseek-v4-flash:free
 *
 * NOTE: trinity-large-thinking is a reasoning model. It wraps its thinking
 * in <think>...</think> blocks. We strip those and return only the final answer.
 */

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1/chat/completions'

const MODEL_A   = 'meta-llama/llama-3.3-70b-instruct:free'
const MODEL_B   = 'meta-llama/llama-3.1-70b-instruct:free'
const MODEL_CON = 'meta-llama/llama-3.3-70b-instruct:free'

function getKey(): string {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) throw new Error('Missing OPENROUTER_API_KEY in environment')
  return key
}

function stripThinking(text: string): string {
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/^[\s\n]+/, '')
    .trim()
}

function extractContent(choice: any): string {
  const msg = choice?.message

  function textFrom(val: unknown): string {
    if (!val) return ''
    if (typeof val === 'string') return val
    if (Array.isArray(val)) {
      return val
        .filter((p: any) => p?.type === 'text' && p?.text)
        .map((p: any) => p.text as string)
        .join('\n')
        .trim()
    }
    return ''
  }

  const content = textFrom(msg?.content)
  if (content) return stripThinking(content)

  const reasoning = textFrom(msg?.reasoning_content ?? msg?.reasoning)
  if (reasoning) return stripThinking(reasoning)

  return ''
}

async function callOpenRouter(
  model: string,
  systemPrompt: string,
  userMessage: string,
  retries = 3
): Promise<string> {
  if (retries === 0) throw new Error(`OpenRouter model ${model} failed after all retries.`)

  const key = getKey()

  let response: Response
  try {
    response = await fetch(OPENROUTER_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
        'X-Title': 'TUSK Debate',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userMessage  },
        ],
        max_tokens: 800,
        temperature: 0.7,
        include_reasoning: true,
      }),
    })
  } catch (networkErr: any) {
    if (retries > 1) {
      await new Promise(r => setTimeout(r, 1500))
      return callOpenRouter(model, systemPrompt, userMessage, retries - 1)
    }
    throw networkErr
  }

  if (response.status === 429) {
    if (retries > 1) {
      await new Promise(r => setTimeout(r, 3000))
      return callOpenRouter(model, systemPrompt, userMessage, retries - 1)
    }
    throw new Error('OpenRouter rate limit hit. Try again shortly.')
  }

  if (response.status >= 500) {
    if (retries > 1) {
      await new Promise(r => setTimeout(r, 1500))
      return callOpenRouter(model, systemPrompt, userMessage, retries - 1)
    }
    throw new Error(`OpenRouter server error ${response.status}`)
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`OpenRouter error ${response.status}: ${body}`)
  }

  const data = await response.json()

  if (data.error) {
    const msg = data.error?.message ?? JSON.stringify(data.error)
    if (retries > 1 && (data.error?.code === 503 || data.error?.code === 'model_error')) {
      await new Promise(r => setTimeout(r, 2000))
      return callOpenRouter(model, systemPrompt, userMessage, retries - 1)
    }
    throw new Error(`OpenRouter model error: ${msg}`)
  }

  const choice = data.choices?.[0]
  if (!choice) throw new Error(`OpenRouter returned no choices for model ${model}`)

  const text = extractContent(choice)

  if (!text) {
    console.error('[OpenRouter] Empty content. Raw choice:', JSON.stringify(choice, null, 2))
    throw new Error(`OpenRouter returned empty content for model ${model}`)
  }

  return text
}

export function callOpenRouterA(systemPrompt: string, userMessage: string): Promise<string> {
  return callOpenRouter(MODEL_A, systemPrompt, userMessage)
}

export function callOpenRouterB(systemPrompt: string, userMessage: string): Promise<string> {
  return callOpenRouter(MODEL_B, systemPrompt, userMessage)
}

export function callOpenRouterConclusion(systemPrompt: string, userMessage: string): Promise<string> {
  return callOpenRouter(MODEL_CON, systemPrompt, userMessage)
}
