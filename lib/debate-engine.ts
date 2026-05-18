import { callAgentA, callAgentB, callConclusion, getAgentNames } from './ai-provider'
import { updateSession, insertTurns, insertConclusion } from './dev-store'
import { DEBATE_LIMITS, type ConclusionData } from '../types'

const FOR_SYSTEM_PROMPT = (topic: string) => `You are a skilled debater arguing FOR the following topic.
Your role: Present the strongest possible case in support.
Rules:
- Be specific and use logical reasoning
- Keep response to 150-200 words
- Do not concede the debate
- Reference the opponent's previous arguments if this is not round 1
Topic: ${topic}`

const AGAINST_SYSTEM_PROMPT = (topic: string) => `You are a skilled debater arguing AGAINST the following topic.
Your role: Present the strongest possible case in opposition.
Rules:
- Be specific and use logical reasoning
- Keep response to 150-200 words
- Do not concede the debate
- Reference the opponent's previous arguments if this is not round 1
Topic: ${topic}`

const CONCLUSION_SYSTEM_PROMPT = `You are an impartial analyst reviewing a debate transcript.
Generate a structured conclusion. Be honest. Do not give a diplomatic non-answer.

CRITICAL: Your entire response must be ONLY valid JSON. No text before or after. No markdown. No explanation.

Return ONLY this exact JSON structure:
{
  "executiveSummary": "2-3 sentences",
  "keyPointsFor": ["point 1", "point 2", "point 3"],
  "keyPointsAgainst": ["point 1", "point 2", "point 3"],
  "unresolvedTensions": ["tension 1"],
  "finalVerdict": "which side made the stronger case and why",
  "confidenceLevel": "Medium"
}

Do NOT include any text outside the JSON object. Start with { and end with }.`

const ANALYSIS_AGENT_A = (idea: string) => `You are a strategic product builder. Your job is to take a raw idea and actively develop it into something concrete and viable.

Rules:
- In round 1: Identify the core value proposition. Define who it's for, what problem it solves, and what the simplest working version looks like. Propose a specific structure, mechanism, or framework that makes it real.
- In later rounds: Build on what was discussed. Add implementation specifics — tech stack choices, go-to-market angle, monetization model, or a phased rollout plan. Make the idea more complete with each round.
- ALWAYS add something new and concrete. Never just restate or praise.
- If something is unrealistic, replace it with a realistic alternative — don't just flag it.
- Keep response to 150-200 words.
- Directly respond to the stress-tester's concerns with solutions, not defensiveness.

Idea: ${idea}`

const ANALYSIS_AGENT_B = (idea: string) => `You are a pragmatic stress-tester. Your job is to pressure-test the idea so it becomes bulletproof — not to kill it.

Rules:
- In round 1: Find the 2-3 most critical weak points: hidden assumptions, market risks, technical blockers, or cost traps. For each one, propose a specific fix, pivot, or validation step that would resolve it.
- In later rounds: Evaluate whether the builder's solutions actually hold up. Push on feasibility — what would this cost, how long would it take, what skills are needed? Suggest concrete alternatives or safeguards where the plan is still shaky.
- NEVER just criticize. Every concern must come with a realistic path forward.
- Ground everything in real-world constraints: budget, timeline, user behavior, competition, technical complexity.
- Keep response to 150-200 words.
- Reference the builder's specific proposals and push them further.

Idea: ${idea}`

const ANALYSIS_CONCLUSION = `You are a pragmatic product advisor reviewing a session where two agents worked to strengthen an idea.
Generate a structured assessment. Be honest and specific. Do NOT give generic encouragement.

CRITICAL: Your entire response must be ONLY valid JSON. No text before or after. No markdown. No explanation.

Return ONLY this exact JSON structure:
{
  "executiveSummary": "2-3 sentences summarizing the refined idea and its current state",
  "keyPointsFor": ["concrete strength 1", "concrete strength 2", "concrete strength 3"],
  "keyPointsAgainst": ["remaining risk 1", "remaining risk 2", "remaining risk 3"],
  "unresolvedTensions": ["open question or trade-off 1", "open question 2"],
  "finalVerdict": "specific assessment: what the idea looks like after refinement, what the next concrete step should be, and what would make or break it",
  "confidenceLevel": "Medium",
  "recommendedActions": ["specific action 1 with concrete steps", "specific action 2 with concrete steps", "specific action 3 with concrete steps"],
  "improvementSuggestions": ["specific improvement 1 with how to implement it", "specific improvement 2 with how to implement it"]
}

Do NOT include any text outside the JSON object. Start with { and end with }.`

// PRD prompt — takes only the refined idea summary, not the full transcript.
// Keeps the input small so Cerebras never hits token limits.
const PRD_SYSTEM_PROMPT = `You are a senior product manager writing a concise Product Requirements Document (PRD).
Be specific, realistic, and actionable. No fluff.

CRITICAL: Your entire response must be ONLY valid JSON. No text before or after. No markdown. No explanation.

Return ONLY this exact JSON structure:
{
  "problemStatement": "1-2 sentences: the specific problem this idea solves and why it matters now",
  "targetUsers": "who exactly will use this — be specific about demographics, context, and pain points",
  "coreFeatures": ["feature 1: what it does and why it is essential", "feature 2: what it does and why it is essential", "feature 3: what it does and why it is essential", "feature 4: what it does and why it is essential"],
  "successMetrics": ["measurable metric 1 with target number and timeframe", "measurable metric 2 with target number and timeframe", "measurable metric 3 with target number and timeframe"],
  "outOfScope": ["thing NOT in v1 and the reason why", "thing 2 and reason", "thing 3 and reason"],
  "mvpScope": "1-2 sentences: the smallest shippable version that validates the core assumption"
}

Do NOT include any text outside the JSON object. Start with { and end with }.`

export interface Turn {
  roundNum: number
  agent: 'A' | 'B'
  agentName: string
  role: 'For' | 'Against' | 'Builder' | 'StressTester'
  content: string
}

export interface DebateResult {
  turns: Turn[]
  conclusion: ConclusionData
}

function parseConclusionJSON(raw: string): ConclusionData {
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/```\s*$/, '')
    .trim()

  try {
    return JSON.parse(cleaned) as ConclusionData
  } catch {
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1)) as ConclusionData
      } catch {
        // fall through
      }
    }
  }

  console.error('[debate] Failed to parse conclusion JSON. Raw:', raw.slice(0, 300))
  return {
    executiveSummary: 'The session completed but the verdict could not be formatted.',
    keyPointsFor: ['See transcript for details'],
    keyPointsAgainst: ['See transcript for details'],
    unresolvedTensions: ['Conclusion parsing failed'],
    finalVerdict: 'Review the transcript above for the full discussion.',
    confidenceLevel: 'Low',
    recommendedActions: ['Review the discussion transcript for actionable insights'],
    improvementSuggestions: ['Review the discussion transcript for improvement ideas'],
  }
}

function parsePRDJSON(raw: string): ConclusionData['prd'] | null {
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/```\s*$/, '')
    .trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  try {
    return JSON.parse(cleaned.slice(start, end + 1))
  } catch {
    console.error('[debate] PRD JSON parse failed. Raw:', raw.slice(0, 300))
    return null
  }
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function callWithRetry<T>(
  fn: () => Promise<T>,
  retries = DEBATE_LIMITS.MAX_RETRIES
): Promise<T> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (attempt === retries - 1) throw err
      await sleep(1000 * 2 ** attempt)
    }
  }
  throw new Error('unreachable')
}

// Full pipeline: run debate + persist to dev-store incrementally
export async function runDebateAndPersist(
  sessionId: string,
  _userId: string,
  topic: string,
  rounds: number,
  _userEmail: string,
  _notifyEmail: boolean,
  mode: 'debate' | 'analysis' = 'debate'
): Promise<void> {
  console.log(`[debate] Starting session ${sessionId} | mode: ${mode} | rounds: ${rounds}`)
  try {
    const { agentA, agentB } = getAgentNames()
    const turns: Turn[] = []
    let totalTurns = 0

    const promptA = mode === 'analysis' ? ANALYSIS_AGENT_A(topic) : FOR_SYSTEM_PROMPT(topic)
    const promptB = mode === 'analysis' ? ANALYSIS_AGENT_B(topic) : AGAINST_SYSTEM_PROMPT(topic)
    const topicLabel = mode === 'analysis' ? 'Idea' : 'Topic'
    const roleA = mode === 'analysis' ? 'Builder' : 'For'
    const roleB = mode === 'analysis' ? 'Stress Tester' : 'Against'

    for (let round = 1; round <= rounds; round++) {
      if (totalTurns >= DEBATE_LIMITS.MAX_TURNS_PER_SESSION) break

      console.log(`[debate] Round ${round} — calling Agent A...`)
      const transcriptSoFar = turns
        .map(t => `[${t.agentName} — ${t.role}]: ${t.content}`)
        .join('\n\n')

      const forMessage = round === 1
        ? `${topicLabel}: ${topic}`
        : `${topicLabel}: ${topic}\n\nDiscussion so far:\n${transcriptSoFar}\n\nNow give your round ${round} input as ${roleA}.`

      const contentA = await callWithRetry(() => callAgentA(promptA, forMessage))
      console.log(`[debate] Round ${round} Agent A done (${contentA.length} chars)`)
      turns.push({ roundNum: round, agent: 'A', agentName: agentA, role: roleA as Turn['role'], content: contentA })
      totalTurns++
      insertTurns([{ session_id: sessionId, round_num: round, agent: 'A', content: contentA, token_count: null }])

      if (totalTurns >= DEBATE_LIMITS.MAX_TURNS_PER_SESSION) break

      const transcriptWithA = turns
        .map(t => `[${t.agentName} — ${t.role}]: ${t.content}`)
        .join('\n\n')
      const againstMessage = `${topicLabel}: ${topic}\n\nDiscussion so far:\n${transcriptWithA}\n\nNow give your round ${round} input as ${roleB}.`

      console.log(`[debate] Round ${round} — calling Agent B...`)
      const contentB = await callWithRetry(() => callAgentB(promptB, againstMessage))
      console.log(`[debate] Round ${round} Agent B done (${contentB.length} chars)`)
      turns.push({ roundNum: round, agent: 'B', agentName: agentB, role: roleB as Turn['role'], content: contentB })
      totalTurns++
      insertTurns([{ session_id: sessionId, round_num: round, agent: 'B', content: contentB, token_count: null }])
    }

    console.log(`[debate] All rounds done, generating conclusion...`)
    const fullTranscript = turns
      .map(t => `[${t.agentName} — ${t.role}, Round ${t.roundNum}]: ${t.content}`)
      .join('\n\n')

    const conclusionSystemPrompt = mode === 'analysis' ? ANALYSIS_CONCLUSION : CONCLUSION_SYSTEM_PROMPT
    const conclusionRaw = await callWithRetry(() =>
      callConclusion(conclusionSystemPrompt, `${topicLabel}: ${topic}\n\nFull transcript:\n${fullTranscript}`)
    )
    const conclusion = parseConclusionJSON(conclusionRaw)

    // PRD: only for analysis mode. Input is just the refined idea + the verdict/summary —
    // intentionally small so Cerebras never hits token limits.
    if (mode === 'analysis') {
      console.log(`[debate] Generating PRD from verdict...`)
      try {
        const prdInput = `Idea: ${topic}\n\nRefined idea summary: ${conclusion.executiveSummary}\n\nFinal assessment: ${conclusion.finalVerdict}`
        const prdRaw = await callWithRetry(() => callConclusion(PRD_SYSTEM_PROMPT, prdInput))
        console.log(`[debate] PRD raw (first 200 chars):`, prdRaw.slice(0, 200))
        const prd = parsePRDJSON(prdRaw)
        if (prd) {
          conclusion.prd = prd
          console.log(`[debate] PRD attached, keys:`, Object.keys(prd))
        }
      } catch (prdErr: any) {
        console.error('[debate] PRD generation failed (non-fatal):', prdErr?.message)
      }
    }

    insertConclusion(sessionId, JSON.stringify(conclusion))
    updateSession(sessionId, { status: 'complete' })
    console.log(`[debate] Session ${sessionId} marked complete`)
  } catch (err: any) {
    console.error(`[debate] Session ${sessionId} failed:`, err?.message ?? err)
    updateSession(sessionId, {
      status: 'failed',
      error_msg: err?.message ?? 'Unknown error',
    })
  }
}
