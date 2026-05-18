import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase'
import { getAgentNames } from '@/lib/ai-provider'
import { TurnBubble } from '@/components/debate/TurnBubble'
import { ConclusionPanel } from '@/components/debate/ConclusionPanel'
import type { DbSession, DbTurn, DbConclusion } from '@/types'
import { Share2, Clock, ArrowRight } from 'lucide-react'

interface PageProps { params: Promise<{ id: string }> }

async function getSession(slug: string): Promise<DbSession | null> {
  const supabase = createServerClient()
  const { data } = await supabase.from('sessions').select('*').eq('share_slug', slug).single()
  return data
    ? { ...data, mode: data.mode || 'debate' }
    : null
}
async function getTurns(sessionId: string): Promise<DbTurn[]> {
  const supabase = createServerClient()
  const { data } = await supabase.from('turns').select('*').eq('session_id', sessionId)
    .order('round_num', { ascending: true }).order('agent', { ascending: true })
  return data ?? []
}
async function getConclusion(sessionId: string): Promise<DbConclusion | null> {
  const supabase = createServerClient()
  const { data } = await supabase.from('conclusions').select('*').eq('session_id', sessionId).single()
  return data ?? null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const session = await getSession(id)
  if (!session || session.status !== 'complete') return { title: 'TUSK Debate' }
  return {
    title: `${session.topic} — TUSK`,
    description: `AI debate: "${session.topic}"`,
    openGraph: { title: `${session.topic} — TUSK`, description: `AI debate: "${session.topic}"` },
  }
}

export default async function SharePage({ params }: PageProps) {
  const { id } = await params
  const session = await getSession(id)
  if (!session) notFound()

  if (session.status !== 'complete') {
    return (
      <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden bg-background">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(ellipse 80% 70% at center, black 0%, transparent 80%)',
        }} />
        <div className="text-center space-y-5 relative z-10 max-w-sm">
          <div className="inline-flex items-center justify-center size-14 mx-auto" style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <Clock className="size-7 text-white/40 animate-pulse" />
          </div>
          <h2 className="text-lg font-bold text-white/80 font-mono uppercase tracking-wider">Debate in progress</h2>
          <p className="text-xs font-mono text-white/30 leading-relaxed">
            This debate is still being processed. Check back once it has finished.
          </p>
        </div>
      </div>
    )
  }

  const [turns, conclusion] = await Promise.all([getTurns(session.id), getConclusion(session.id)])
  const agentNames = getAgentNames()
  const dbConclusion: DbConclusion | null = conclusion ?? null

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Fine grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
        maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 80%)',
      }} />

      <div className="max-w-3xl mx-auto px-4 py-28 space-y-6 relative z-10">

        {/* Shared badge */}
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] px-4 py-1.5" style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.35)',
          }}>
            <Share2 className="size-3" />
            Shared Debate
          </span>
        </div>

        {/* Topic */}
        <div className="relative p-6 overflow-hidden" style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)',
        }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          }} />
          <h1 className="text-xl md:text-2xl font-bold text-white/90 font-mono leading-tight mb-2">
            {session.topic}
          </h1>
          <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest">
            {new Date(session.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Agent legend */}
        <div className="grid grid-cols-2 gap-px bg-white/[0.06]">
          {[
            { label: 'FOR',     name: agentNames.agentA },
            { label: 'AGAINST', name: agentNames.agentB },
          ].map(a => (
            <div key={a.label} className="px-4 py-3 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/25 mb-1">{a.label}</p>
              <p className="text-xs font-mono text-white/60">{a.name}</p>
            </div>
          ))}
        </div>

        {/* Turns */}
        <div className="space-y-4">
          {turns.map(turn => (
            <TurnBubble key={turn.id} turn={turn} agentNames={agentNames} />
          ))}
        </div>

        {/* Conclusion */}
        {dbConclusion && (
          <div className="relative overflow-hidden" style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)',
          }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            }} />
            <div className="p-6">
              <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/25 mb-5">AI Verdict</p>
              <ConclusionPanel
                conclusion={dbConclusion} turns={turns} topic={session.topic}
                shareSlug={session.share_slug ?? session.id} hideActions={true}
                mode={session.mode}
              />
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="relative p-8 text-center overflow-hidden" style={{
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
        }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
          }} />
          <p className="text-xs font-mono text-white/30 uppercase tracking-widest mb-5">
            Run your own debate
          </p>
          <a href="/debate/new" className="btn-primary inline-flex items-center gap-2 px-7 py-3 text-sm">
            Start for free
            <ArrowRight className="size-4" />
          </a>
        </div>

      </div>
    </div>
  )
}
