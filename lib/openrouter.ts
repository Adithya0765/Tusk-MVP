/**
 * OpenRouter — generic model caller for premium tiers.
 * Docs: https://openrouter.ai/docs
 */

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1/chat/completions'

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

function extractContent(choice: Record<string, unknown>): string {
  const msg = choice?.message as Record<string, unknown> | undefined
  const content = msg?.content
  if (typeof content === 'string') return stripThinking(content)
  if (Array.isArray(content)) {
    return stripThinking(
      content
        .filter((p: unknown) => (p as Record<string, unknown>)?.type === 'text')
        .map((p: unknown) => (p as Record<string, unknown>).text as string)
        .join('\n')
        .trim()
    )
  }
  return ''
}

export async function callOpenRouterModel(
  model: string,
  systemPrompt: string,
  userMessage: string,
  retries = 3
): Promise<string> {
  if (retries === 0) throw new Error(`OpenRouter model ${model} failed after all retries.`)

  const key = getKey()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  let response: Response
  try {
    response = await fetch(OPENROUTER_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        'HTTP-Referer': appUrl,
        'X-Title': 'TUSK',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userMessage  },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })
  } catch (networkErr: unknown) {
    if (retries > 1) {
      await new Promise(r => setTimeout(r, 1500))
      return callOpenRouterModel(model, systemPrompt, userMessage, retries - 1)
    }
    throw networkErr
  }

  if (response.status === 429) {
    if (retries > 1) {
      await new Promise(r => setTimeout(r, 3000))
      return callOpenRouterModel(model, systemPrompt, userMessage, retries - 1)
    }
    throw new Error('OpenRouter rate limit hit. Try again shortly.')
  }

  if (response.status >= 500) {
    if (retries > 1) {
      await new Promise(r => setTimeout(r, 1500))
      return callOpenRouterModel(model, systemPrompt, userMessage, retries - 1)
    }
    throw new Error(`OpenRouter server error ${response.status}`)
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`OpenRouter error ${response.status}: ${body}`)
  }

  const data = await response.json()

  if (data.error) {
    const msg = (data.error as Record<string, unknown>)?.message ?? JSON.stringify(data.error)
    throw new Error(`OpenRouter model error: ${msg}`)
  }

  const choice = data.choices?.[0]
  if (!choice) throw new Error(`OpenRouter returned no choices for model ${model}`)

  const text = extractContent(choice)
  if (!text) throw new Error(`OpenRouter returned empty content for model ${model}`)

  return text
}
