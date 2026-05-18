'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ConclusionPanel } from '@/components/debate/ConclusionPanel'
import { TypewriterText } from '@/components/debate/TypewriterText'
import type { DbSession, DbTurn, DbConclusion } from '@/types'
import { ChevronLeft, AlertTriangle, RotateCcw, Sparkles, MessageSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface DebateData {
  session: DbSession; turns: DbTurn[]
  conclusion: Record<string, unknown> | null
  agentNames: { agentA: string; agentB: string }
}

interface TypewriterState {
  text: string
  key: string
}

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
  const [activeSpeaker, setActiveSpeaker] = useState<'A' | 'B' | null>(null)
  const [typewriterTargets, setTypewriterTargets] = useState<Record<string, TypewriterState>>({})
  const [showVerdict, setShowVerdict] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevTurnCountRef = useRef(0)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const verdictAnnouncedRef = useRef(false)

  function stopPolling() {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }

  async function fetchFullData() {
    const res = await fetch(`/api/debate/${id}`)
    if (res.status === 404) { setNotFound(true); setLoading(false); return }
    if (!res.ok) { setLoading(false); return }
    const newData = await res.json()
    
    const newTurnCount = newData.turns?.length || 0
    if (newTurnCount > prevTurnCountRef.current && newData.turns.length > 0) {
      const latestTurn = newData.turns[newData.turns.length - 1]
      setActiveSpeaker(latestTurn.agent)
      
      setTypewriterTargets(prev => ({
        ...prev,
        [`turn-${latestTurn.id}`]: {
          text: latestTurn.content,
          key: `turn-${latestTurn.id}-${Date.now()}`
        }
      }))
      
      setTimeout(() => setActiveSpeaker(null), latestTurn.content.length * 20 + 500)
    }
    prevTurnCountRef.current = newTurnCount
    
    if (newData.session.status === 'complete' && !verdictAnnouncedRef.current) {
      verdictAnnouncedRef.current = true
      setTimeout(() => setShowVerdict(true), 800)
    }
    
    setData(newData)
    setLoading(false)
  }

  useEffect(() => { 
    fetchFullData() 
    const interval = setInterval(() => { fetchFullData() }, 2000)
    intervalRef.current = interval
    return () => clearInterval(interval)
  }, [id]) 

  useEffect(() => {
    if (data?.session.status === 'complete' || data?.session.status === 'failed') {
      stopPolling()
    }
  }, [data?.session.status])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [data?.turns?.length])

  if (loading && !data) return (
    <div className="h-screen relative flex items-center justify-center overflow-hidden bg-background">
      {BG}
      <div className="relative z-10"><Spinner label="Loading debate…" /></div>
    </div>
  )

  if (notFound || !data) return (
    <div className="h-screen relative flex items-center justify-center px-4 overflow-hidden bg-background">
      {BG}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center space-y-5 relative z-10 max-w-sm">
        <div className="inline-flex items-center justify-center size-16 mx-auto" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
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

  if (data.session.status === 'failed') return (
    <div className="h-screen relative flex items-center justify-center px-4 overflow-hidden bg-background">
      {BG}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center space-y-5 max-w-md relative z-10">
        <div className="inline-flex items-center justify-center size-16 mx-auto" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <AlertTriangle className="size-8 text-red-400/70" />
        </div>
        <div className="p-5" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)' }}>
          <p className="text-red-400/80 font-bold font-mono mb-1.5 text-sm uppercase">Debate failed</p>
          {data.session.error_msg && <p className="text-xs font-mono text-white/35">{data.session.error_msg}</p>}
        </div>
        <Link href="/debate/new" className="inline-flex items-center gap-2 text-sm font-mono text-white/40 hover:text-white/80 transition-colors group">
          <RotateCcw className="size-4 group-hover:rotate-180 transition-transform duration-500" />
          Try again
        </Link>
      </motion.div>
    </div>
  )

  const { session, turns, conclusion, agentNames } = data
  const isProcessing = session.status === 'processing'
  const currentRound = turns.length > 0 ? Math.ceil(turns.length / 2) : 0
  const totalRounds = session.rounds
  const progressPercent = isProcessing ? Math.min((currentRound / totalRounds) * 100, 95) : 100

  const dbConclusion: DbConclusion | null = conclusion
    ? { id: session.id, session_id: session.id, content: JSON.stringify(conclusion), created_at: session.updated_at }
    : null

  const agentConfig = [
    { id: 'A', name: agentNames.agentA, label: session.mode === 'analysis' ? 'Analyst' : 'Pro' },
    { id: 'B', name: agentNames.agentB, label: session.mode === 'analysis' ? 'Critic' : 'Con' }
  ]

  return (
    <div className="h-screen relative overflow-hidden bg-background flex flex-col">
      {BG}
      
      {/* Top Navbar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-3 border-b shrink-0" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)' }}>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center justify-center size-8 transition-all duration-200 hover:-translate-x-0.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <ChevronLeft className="size-4 text-white/60" />
          </Link>
          <h1 className="text-base font-bold text-white/90 font-mono tracking-tight truncate max-w-[300px]">{session.topic}</h1>
        </div>
        
        {/* Progress Indicator */}
        <div className="flex items-center gap-4">
          {isProcessing && (
            <div className="flex items-center gap-3">
              <div className="text-xs font-mono text-white/50">
                Round <span className="text-white/80 font-semibold">{currentRound}</span> / {totalRounds}
              </div>
              <div className="w-32 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <motion.div
                  className="h-full rounded-full"
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5 }}
                  style={{ background: 'linear-gradient(90deg, rgba(34,197,94,0.6), rgba(34,197,94,0.9))' }}
                />
              </div>
            </div>
          )}
          {!isProcessing && !showVerdict && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono" style={{
              background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: 'rgba(59,130,246,0.8)'
            }}>
              <Sparkles className="size-3" />
              Compiling verdict...
            </div>
          )}
          <div className="size-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
        </div>
      </div>

      {/* Main Content - Fixed height, no scrolling */}
      <div className="flex-1 relative z-10 flex overflow-hidden">
        {/* Agent Panels */}
        <div className="flex-1 flex flex-col p-4 gap-4">
          <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
            {agentConfig.map((agent) => {
              const agentTurns = turns.filter(t => t.agent === agent.id)
              const latestTurn = agentTurns[agentTurns.length - 1]
              const isSpeaking = activeSpeaker === agent.id
              const typewriterKey = latestTurn ? `turn-${latestTurn.id}` : null
              const typewriterState = typewriterKey ? typewriterTargets[typewriterKey] : null

              return (
                <motion.div
                  key={agent.id}
                  animate={{ borderColor: isSpeaking ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)' }}
                  className="relative rounded-xl overflow-hidden flex flex-col"
                  style={{ background: 'rgba(20,20,20,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {/* Agent Header */}
                  <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2">
                      <div className="size-6 rounded-full flex items-center justify-center text-xs font-mono font-bold" style={{
                        background: isSpeaking ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)',
                        color: isSpeaking ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)'
                      }}>
                        {agent.name[0]}
                      </div>
                      <span className="text-xs font-mono text-white/70 font-semibold">{agent.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-white/30 uppercase">{agent.label}</span>
                      {isSpeaking && (
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono" style={{
                          background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: 'rgba(34,197,94,0.9)'
                        }}>
                          <div className="size-1.5 rounded-full bg-green-500 animate-pulse" />
                          Speaking
                        </motion.div>
                      )}
                    </div>
                  </div>
                  
                  {/* Response Area */}
                  <div className="flex-1 p-4 overflow-y-auto">
                    {typewriterState ? (
                      <TypewriterText
                        key={typewriterState.key}
                        text={typewriterState.text}
                        speed={12}
                        className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap"
                      />
                    ) : latestTurn ? (
                      <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{latestTurn.content}</p>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-sm text-white/20 italic">Waiting to speak...</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className="w-80 border-l flex flex-col shrink-0" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
          <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <MessageSquare className="size-4 text-white/50" />
            <h2 className="text-xs font-bold font-mono text-white/60 uppercase tracking-widest">Transcript</h2>
            <span className="ml-auto text-[10px] font-mono text-white/25">{turns.length} turns</span>
          </div>
          
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-3 space-y-3">
            <AnimatePresence>
              {turns.map((t) => {
                const isAgentA = t.agent === 'A'
                const typewriterKey = `turn-${t.id}`
                const typewriterState = typewriterTargets[typewriterKey]
                const shouldTypewriter = typewriterState && isProcessing

                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg p-3"
                    style={{
                      background: isAgentA ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderLeft: `2px solid ${isAgentA ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'}`
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-mono text-white/40 font-semibold">
                        {isAgentA ? agentNames.agentA : agentNames.agentB}
                      </span>
                      <span className="text-[9px] font-mono text-white/20">R{t.round_num}</span>
                    </div>
                    <div className="text-xs text-white/60 leading-relaxed">
                      {shouldTypewriter ? (
                        <TypewriterText key={typewriterState.key} text={typewriterState.text} speed={15} className="whitespace-pre-wrap" />
                      ) : (
                        <span className="whitespace-pre-wrap">{t.content}</span>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Verdict Overlay */}
      <AnimatePresence>
        {showVerdict && dbConclusion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="w-full max-w-3xl max-h-[85vh] flex flex-col rounded-xl shadow-2xl"
              style={{ background: 'rgba(15,15,20,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {/* Verdict Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <h2 className="text-lg font-bold font-mono text-white/90 flex items-center gap-2">
                  <Sparkles className="size-5 text-white/60" />
                  Verdict
                </h2>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-xs font-mono rounded text-white/60 hover:text-white/90 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  Close
                </Link>
              </div>
              
              {/* Verdict Content - scrollable */}
              <div className="flex-1 overflow-y-auto p-6">
                <ConclusionPanel
                  conclusion={dbConclusion} turns={turns} topic={session.topic}
                  shareSlug={session.share_slug ?? session.id}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
