/**
 * OpenRouter provider — single API key, multiple models.
 * Docs: https://openrouter.ai/docs
 *
 * Active models:
 *   Agent A (FOR)       : deepseek/deepseek-v4-flash:free
 *   Agent B (AGAINST)   : arcee-ai/trinity-large-thinking:free
 *   Conclusion          : deepseek/deepseek-v4-flash:free
 *
 * NOTE: trinity-large-thinking is a reasoning model. It wraps its thinking
 * in <think>...</think> blocks. We strip those and return only the final answer.
 * If content is empty/null, we fall back to reasoning_content (also stripped).
 */

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1/chat/completions'

const MODEL_A   = 'deepseek/deepseek-v4-flash:free'
const MODEL_B   = 'arcee-ai/trinity-large-thinking:free'
const MODEL_CON = 'deepseek/deepseek-v4-flash:free'

function getKey(): string {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) throw new Error('Missing OPENROUTER_API_KEY in environment')
  return key
}

/**
 * Strip <think>...</think> blocks (and any leading whitespace after).
 * Reasoning models emit these before the actual answer.
 */
function stripThinking(text: string): string {
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/^[\s\n]+/, '')   // trim leading whitespace left behind
    .trim()
}

/**
 * Extract the best available text from an OpenRouter response choice.
 * Handles:
 *   1. Normal models  → choices[0].message.content  (string)
 *   2. Thinking models → content may be empty; fall back to reasoning_content
 *   3. Content is an array of parts (some providers return [{type:'text',text:'...'}])
 */
function extractContent(choice: any): string {
  const msg = choice?.message

  // Helper to pull text out of a value that might be string | array | null
  function textFrom(val: unknown): string {
    if (!val) return ''
    if (typeof val === 'string') return val
    if (Array.isArray(val)) {
      // [{type:'text', text:'...'}, {type:'thinking', thinking:'...'}]
      return val
        .filter((p: any) => p?.type === 'text' && p?.text)
        .map((p: any) => p.text as string)
        .join('\n')
        .trim()
    }
    return ''
  }

  // 1. Try content first
  const content = textFrom(msg?.content)
  if (content) return stripThinking(content)

  // 2. Fall back to reasoning_content (thinking models sometimes put everything here)
  const reasoning = textFrom(msg?.reasoning_content ?? msg?.reasoning)
  if (reasoning) return stripThinking(reasoning)

  // 3. Try the reasoning_details array OpenRouter sometimes returns
  const details = msg?.reasoning_details
  if (Array.isArray(details)) {
    const text = details
      .filter((d: any) => d?.type === 'text' && d?.text)
      .map((d: any) => d.text as string)
      .join('\n')
      .trim()
    if (text) return stripThinking(text)
  }

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
        max_tokens: 600,
        temperature: 0.8,
        // Ask OpenRouter to include reasoning tokens in the response
        include_reasoning: true,
      }),
    })
  } catch (networkErr: any) {
    // Network-level failure — retry
    if (retries > 1) {
      await new Promise(r => setTimeout(r, 1500))
      return callOpenRouter(model, systemPrompt, userMessage, retries - 1)
    }
    throw networkErr
  }

  // Rate limited
  if (response.status === 429) {
    if (retries > 1) {
      await new Promise(r => setTimeout(r, 3000))
      return callOpenRouter(model, systemPrompt, userMessage, retries - 1)
    }
    throw new Error('OpenRouter rate limit hit. Try again shortly.')
  }

  // Transient server error
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

  // Top-level error object inside a 200 (OpenRouter does this for model errors)
  if (data.error) {
    const msg = data.error?.message ?? JSON.stringify(data.error)
    // Some model errors are transient — retry once
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
    // Log the raw response to help debug future issues
    console.error('[OpenRouter] Empty content. Raw choice:', JSON.stringify(choice, null, 2))
    throw new Error(`OpenRouter returned empty content for model ${model}`)
  }

  return text
}

/** Agent A — FOR side */
export function callOpenRouterA(systemPrompt: string, userMessage: string): Promise<string> {
  return callOpenRouter(MODEL_A, systemPrompt, userMessage)
}

/** Agent B — AGAINST side */
export function callOpenRouterB(systemPrompt: string, userMessage: string): Promise<string> {
  return callOpenRouter(MODEL_B, systemPrompt, userMessage)
}

/** Conclusion synthesizer */
export function callOpenRouterConclusion(systemPrompt: string, userMessage: string): Promise<string> {
  return callOpenRouter(MODEL_CON, systemPrompt, userMessage)
}
