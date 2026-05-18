import { callAgentA, callAgentB, callConclusion, getAgentNames } from './ai-provider'
import { updateSession, insertTurns, insertConclusion } from './dev-store'
import { DEBATE_LIMITS } from '../types'

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
Return ONLY valid JSON matching this exact schema:
{
  "executiveSummary": "string (2-3 sentences)",
  "keyPointsFor": ["string", "string", "string"],
  "keyPointsAgainst": ["string", "string", "string"],
  "unresolvedTensions": ["string"],
  "finalVerdict": "string (which side made the stronger case and why)",
  "confidenceLevel": "Low" | "Medium" | "High"
}`

export interface Turn {
  roundNum: number
  agent: 'A' | 'B'
  agentName: string
  role: 'For' | 'Against'
  content: string
}

export interface DebateResult {
  turns: Turn[]
  conclusion: {
    executiveSummary: string
    keyPointsFor: string[]
    keyPointsAgainst: string[]
    unresolvedTensions: string[]
    finalVerdict: string
    confidenceLevel: string
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

// Pure debate logic — returns result without touching DB
export async function runDebate(
  topic: string,
  rounds: number,
  mode: 'debate' | 'analysis' = 'debate'
): Promise<DebateResult> {
  const { agentA, agentB } = getAgentNames()
  const turns: Turn[] = []
  let totalTurns = 0

  const promptA = mode === 'analysis' 
    ? `You are an insightful analyst exploring an idea.
Your role: Highlight the strengths, potential, and constructive additions to the idea.
Rules:
- Be specific and use logical reasoning
- Keep response to 150-200 words
- Work with the other agent to build a comprehensive view
Idea: ${topic}` 
    : FOR_SYSTEM_PROMPT(topic);

  const promptB = mode === 'analysis'
    ? `You are a critical thinker evaluating an idea.
Your role: Identify flaws, edge cases, missing pieces, and challenges in the idea.
Rules:
- Be specific and provide constructive criticism
- Keep response to 150-200 words
- Reference the insights of the other agent if this is not round 1
Idea: ${topic}`
    : AGAINST_SYSTEM_PROMPT(topic);

  for (let round = 1; round <= rounds; round++) {
    if (totalTurns >= DEBATE_LIMITS.MAX_TURNS_PER_SESSION) break

    const transcriptSoFar = turns
      .map(t => `[${t.agentName} — ${t.role}]: ${t.content}`)
      .join('\n\n')

    const topicLabel = mode === 'analysis' ? 'Idea' : 'Topic'
    const roleA = mode === 'analysis' ? 'Strengths' : 'For'
    const roleB = mode === 'analysis' ? 'Challenges' : 'Against'
    
    const forMessage =
      round === 1
        ? `${topicLabel}: ${topic}`
        : `${topicLabel}: ${topic}\n\nDiscussion so far:\n${transcriptSoFar}\n\nNow give your round ${round} point regarding ${roleA}.`

    const contentA = await callWithRetry(() =>
      callAgentA(promptA, forMessage)
    )
    turns.push({ roundNum: round, agent: 'A', agentName: agentA, role: roleA as 'For' | 'Against', content: contentA })
    totalTurns++

    if (totalTurns >= DEBATE_LIMITS.MAX_TURNS_PER_SESSION) break

    const transcriptWithA = turns
      .map(t => `[${t.agentName} — ${t.role}]: ${t.content}`)
      .join('\n\n')

    const againstMessage = `${topicLabel}: ${topic}\n\nDiscussion so far:\n${transcriptWithA}\n\nNow give your round ${round} point regarding ${roleB}.`

    const contentB = await callWithRetry(() =>
      callAgentB(promptB, againstMessage)
    )
    turns.push({ roundNum: round, agent: 'B', agentName: agentB, role: roleB as 'For' | 'Against', content: contentB })
    totalTurns++
  }

  const fullTranscript = turns
    .map(t => `[${t.agentName} — ${t.role}, Round ${t.roundNum}]: ${t.content}`)
    .join('\n\n')

  const conclusionSystemPrompt = mode === 'analysis'
    ? `You are an impartial analyst reviewing a discussion about an idea.
Generate a structured conclusion. Be honest. Do not give a diplomatic non-answer.
Return ONLY valid JSON matching this exact schema:
{
  "executiveSummary": "string (2-3 sentences)",
  "keyPointsFor": ["string", "string", "string"],
  "keyPointsAgainst": ["string", "string", "string"],
  "unresolvedTensions": ["string"],
  "finalVerdict": "string (overall viability of the idea and recommended next steps)",
  "confidenceLevel": "Low" | "Medium" | "High"
}` 
    : CONCLUSION_SYSTEM_PROMPT;

  const conclusionRaw = await callWithRetry(() =>
    callConclusion(
      conclusionSystemPrompt,
      `Topic/Idea: ${topic}\n\nFull transcript:\n${fullTranscript}`
    )
  )

  const jsonStr = conclusionRaw
    .replace(/^```json\s*/i, '')
    .replace(/```\s*$/, '')
    .trim()
  const conclusion = JSON.parse(jsonStr)

  return { turns, conclusion }
}

// Full pipeline: run debate + persist to dev-store
export async function runDebateAndPersist(
  sessionId: string,
  _userId: string,
  topic: string,
  rounds: number,
  _userEmail: string,
  _notifyEmail: boolean,
  mode: 'debate' | 'analysis' = 'debate'
): Promise<void> {
  try {
    const result = await runDebate(topic, rounds, mode)

    // Persist turns
    insertTurns(result.turns.map(t => ({
      session_id: sessionId,
      round_num: t.roundNum,
      agent: t.agent,
      content: t.content,
      token_count: null,
    })))

    // Persist conclusion
    insertConclusion(sessionId, JSON.stringify(result.conclusion))

    // Mark complete
    updateSession(sessionId, { status: 'complete' })
  } catch (err: any) {
    updateSession(sessionId, {
      status: 'failed',
      error_msg: err?.message ?? 'Unknown error',
    })
  }
}
