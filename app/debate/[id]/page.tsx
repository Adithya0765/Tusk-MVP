'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ConclusionPanel } from '@/components/debate/ConclusionPanel'
import type { DbSession, DbTurn, DbConclusion } from '@/types'
import { ChevronLeft, AlertTriangle, RotateCcw, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'

interface DebateData {
  session: DbSession; turns: DbTurn[]
  conclusion: Record<string, unknown> | null
  agentNames: { agentA: string; agentB: string }
}

/* ─── Spinner ─── */
function Spinner({ label = 'Processing…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24">
      <div className="relative size-16">
        <div className="absolute inset-0 rounded-full animate-spin" style={{
          border: '1px solid rgba(255,255,255,0.08)',
          borderTopColor: 'rgba(255,255,255,0.6)',
          animationDuration: '1s',
        }} />
        <div className="absolute inset-2.5 rounded-full animate-spin" style={{
          border: '1px solid rgba(255,255,255,0.05)',
          borderRightColor: 'rgba(255,255,255,0.35)',
          animationDuration: '1.6s',
          animationDirection: 'reverse',
        }} />
        <div className="absolute inset-[22%] rounded-full" style={{
          background: 'rgba(255,255,255,0.08)',
          animation: 'ping-slow 2s cubic-bezier(0,0,0.2,1) infinite',
        }} />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-mono text-white/50 animate-pulse">{label}</p>
        <p className="text-xs font-mono text-white/25">This usually takes 30–60 seconds</p>
      </div>
    </div>
  )
}

/* ─── Background ─── */
const BG = (
  <>
    <div className="absolute inset-0 pointer-events-none" style={{
      backgroundImage: `
        linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
      `,
      backgroundSize: '24px 24px',
      maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 80%)',
    }} />
  </>
)

export default function DebatePage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<DebateData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function stopPolling() {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }

  async function fetchFullData() {
    const res = await fetch(`/api/debate/${id}`)
    if (res.status === 404) { setNotFound(true); setLoading(false); return }
    if (!res.ok) { setLoading(false); return }
    setData(await res.json()); setLoading(false)
  }

  async function pollStatus() {
    const res = await fetch(`/api/debate/${id}/status`)
    if (!res.ok) return
    const j = await res.json()
    if (j.status === 'complete' || j.status === 'failed') { stopPolling(); await fetchFullData() }
  }

  useEffect(() => { fetchFullData(); return () => stopPolling() }, [id]) // eslint-disable-line
  useEffect(() => {
    if (data?.session.status === 'processing' && !intervalRef.current) intervalRef.current = setInterval(pollStatus, 5000)
    else if (data?.session.status !== 'processing') stopPolling()
  }, [data?.session.status]) // eslint-disable-line

  if (loading) return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-background">
      {BG}
      <div className="relative z-10"><Spinner label="Loading debate…" /></div>
    </div>
  )

  if (notFound || !data) return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden bg-background">
      {BG}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-5 relative z-10 max-w-sm"
      >
        <div className="inline-flex items-center justify-center size-16 mx-auto" style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <AlertTriangle className="size-8 text-white/50" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white/90 mb-2 font-mono uppercase">Debate not found</h2>
          <p className="text-sm font-mono text-white/35">This debate doesn&apos;t exist or you don&apos;t have access.</p>
        </div>
        <Link href="/debate/new" className="inline-flex items-center gap-2 text-sm font-mono text-white/40 hover:text-white/80 transition-colors group">
          <ChevronLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
          Start a new debate
        </Link>
      </motion.div>
    </div>
  )

  const { session, turns, conclusion, agentNames } = data

  if (session.status === 'processing') return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {BG}
      <div className="max-w-2xl mx-auto px-4 py-28 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative p-6 mb-8 overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="absolute top-0 left-0 right-0 h-px" style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
          }} />
          <h1 className="text-xl font-bold text-white/90 mb-1.5 font-mono">{session.topic}</h1>
          <p className="text-xs font-mono text-white/30">Session · {session.id.slice(0, 8)}…</p>
        </motion.div>
        <Spinner />
      </div>
    </div>
  )

  if (session.status === 'failed') return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden bg-background">
      {BG}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-5 max-w-md relative z-10"
      >
        <div className="inline-flex items-center justify-center size-16 mx-auto" style={{
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
        }}>
          <AlertTriangle className="size-8 text-red-400/70" />
        </div>
        <div className="p-5" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)' }}>
          <p className="text-red-400/80 font-bold font-mono mb-1.5 text-sm uppercase">Debate failed</p>
          {session.error_msg && <p className="text-xs font-mono text-white/35">{session.error_msg}</p>}
        </div>
        <Link href="/debate/new" className="inline-flex items-center gap-2 text-sm font-mono text-white/40 hover:text-white/80 transition-colors group">
          <RotateCcw className="size-4 group-hover:rotate-180 transition-transform duration-500" />
          Try again
        </Link>
      </motion.div>
    </div>
  )

  const dbConclusion: DbConclusion | null = conclusion
    ? { id: session.id, session_id: session.id, content: JSON.stringify(conclusion), created_at: session.updated_at }
    : null

  return (
    <div className="min-h-screen relative overflow-hidden bg-background flex flex-col">
      {BG}
      {/* Top Navbar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center justify-center size-9 mt-1 transition-all duration-200 hover:-translate-x-0.5"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <ChevronLeft className="size-4 text-white/60" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-xl font-bold text-white/90 leading-tight font-mono tracking-tight truncate max-w-[400px]">
              {session.topic}
            </h1>
            <p className="text-xs font-mono text-white/40">
              Meeting Session · {new Date(session.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-8 rounded-full border border-white/10 bg-white/5">
            <div className="size-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
          </div>
        </div>
      </div>

      <div className="flex-1 relative z-10 flex flex-col md:flex-row overflow-hidden">
        {/* Main Video Area */}
        <div className="flex-1 flex items-center justify-center p-6 gap-6 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full h-full max-h-[80vh]">
            {[
              { id: 'A', name: agentNames.agentA, label: 'Analysis / For', color: 'blue' },
              { id: 'B', name: agentNames.agentB, label: 'Critic / Against', color: 'red' }
            ].map((agent) => (
              <div key={agent.id} className="relative rounded-xl overflow-hidden shadow-xl" style={{ background: 'rgba(20,20,20,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {/* Simulated video feed element */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <div className={`size-32 rounded-full border-4 border-${agent.color}-500 flex items-center justify-center bg-${agent.color}-500/20`}>
                    <p className="text-4xl font-mono text-white">{agent.name[0]}</p>
                  </div>
                </div>
                
                {/* Subtitle / latest talking point */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm p-4 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-xs font-mono text-white/70 font-semibold">{agent.name}</p>
                  </div>
                  <p className="text-sm text-white/80 line-clamp-3">
                    {turns.filter(t => t.agent === agent.id).pop()?.content || 'Waiting...'}
                  </p>
                </div>
                
                <div className="absolute top-4 left-4">
                  <div className="bg-black/60 backdrop-blur-sm px-3 py-1 rounded text-xs text-white/60 font-mono border border-white/10 uppercase">
                    {agent.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar / Chat view */}
        <div className="w-full md:w-96 border-l flex flex-col bg-background/50 backdrop-blur-md" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="p-4 border-b border-white/5">
            <h2 className="text-sm font-bold font-mono text-white/80 uppercase tracking-widest">Meeting Chat</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {turns.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <div className="flex flex-col mb-1">
                  <span className="text-xs font-mono text-white/50 mb-0.5">
                    {t.agent === 'A' ? agentNames.agentA : agentNames.agentB}
                  </span>
                  <div className="p-3 text-sm text-white/70" style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {t.content}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Conclusion popover if available */}
      {dbConclusion && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl w-full bg-background rounded-xl p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <h2 className="text-xl font-bold font-mono text-white/90 mb-6 flex items-center gap-2">
              <Sparkles className="size-5" /> Verdict / Analysis Result
            </h2>
            <ConclusionPanel
              conclusion={dbConclusion} turns={turns} topic={session.topic}
              shareSlug={session.share_slug ?? session.id}
            />
            <Link
              href="/dashboard"
              className="mt-8 block w-full text-center text-sm font-mono py-3 rounded text-white/60 hover:text-white/90 bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
            >
              Close Meeting
            </Link>
          </motion.div>
        </div>
      )}
    </div>
  )
}
