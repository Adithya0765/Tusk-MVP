/**
 * In-memory store — used for the MVP while a persistent DB is not yet wired.
 * Data lives in process memory and resets on server restart / cold start.
 * Uses globalThis to survive Next.js hot module reloads in development.
 */

export const DEV_USER_ID = 'dev-user-001'

export interface DevSession {
  id: string
  user_id: string
  topic: string
  mode: 'debate' | 'analysis'
  status: 'processing' | 'complete' | 'failed'
  rounds: number
  share_slug: string
  error_msg: string | null
  created_at: string
  updated_at: string
}

export interface DevTurn {
  id: string
  session_id: string
  round_num: number
  agent: 'A' | 'B'
  content: string
  token_count: number | null
}

export interface DevConclusion {
  id: string
  session_id: string
  content: string
  created_at: string
}

declare global {
  // eslint-disable-next-line no-var
  var __tusk_store: {
    sessions: Map<string, DevSession>
    turns: Map<string, DevTurn[]>
    conclusions: Map<string, DevConclusion>
  } | undefined
}

const store = globalThis.__tusk_store ?? {
  sessions: new Map<string, DevSession>(),
  turns: new Map<string, DevTurn[]>(),
  conclusions: new Map<string, DevConclusion>(),
}

if (!globalThis.__tusk_store) globalThis.__tusk_store = store

const { sessions, turns, conclusions } = store

// ── Sessions ──────────────────────────────────────────────────────────────

export function createSession(data: Omit<DevSession, 'created_at' | 'updated_at'>): DevSession {
  const now = new Date().toISOString()
  const s: DevSession = { ...data, created_at: now, updated_at: now }
  sessions.set(s.id, s)
  return s
}

export function getSession(id: string): DevSession | undefined {
  return sessions.get(id)
}

export function getSessionBySlug(slug: string): DevSession | undefined {
  for (const s of sessions.values()) {
    if (s.share_slug === slug) return s
  }
  return undefined
}

export function updateSession(id: string, patch: Partial<DevSession>) {
  const s = sessions.get(id)
  if (s) sessions.set(id, { ...s, ...patch, updated_at: new Date().toISOString() })
}

export function listSessions(userId: string): DevSession[] {
  return [...sessions.values()]
    .filter(s => s.user_id === userId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export function countProcessing(userId: string): number {
  return [...sessions.values()]
    .filter(s => s.user_id === userId && s.status === 'processing').length
}

// ── Turns ─────────────────────────────────────────────────────────────────

export function insertTurns(rows: Omit<DevTurn, 'id'>[]) {
  for (const row of rows) {
    const t: DevTurn = { ...row, id: crypto.randomUUID() }
    const list = turns.get(t.session_id) ?? []
    list.push(t)
    turns.set(t.session_id, list)
  }
}

export function getTurns(sessionId: string): DevTurn[] {
  return (turns.get(sessionId) ?? []).sort((a, b) => {
    if (a.round_num !== b.round_num) return a.round_num - b.round_num
    return a.agent.localeCompare(b.agent)
  })
}

// ── Conclusions ───────────────────────────────────────────────────────────

export function insertConclusion(sessionId: string, content: string) {
  conclusions.set(sessionId, {
    id: crypto.randomUUID(),
    session_id: sessionId,
    content,
    created_at: new Date().toISOString(),
  })
}

export function getConclusion(sessionId: string): DevConclusion | undefined {
  return conclusions.get(sessionId)
}
