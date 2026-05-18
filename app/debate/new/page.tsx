'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DEBATE_LIMITS } from '@/types/index'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

export default function NewDebatePage() {
  const router = useRouter()
  const [topic, setTopic] = useState('')
  const [mode, setMode] = useState<'debate' | 'analysis'>('debate')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [focused, setFocused] = useState(false)

  const charCount = topic.length
  const isNearLimit = charCount > 450
  const progress = (charCount / DEBATE_LIMITS.MAX_TOPIC_LENGTH) * 100

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setShowUpgrade(false)
    if (charCount === 0) { setError('Please enter a topic.'); return }
    if (charCount > DEBATE_LIMITS.MAX_TOPIC_LENGTH) {
      setError(`Topic must be ${DEBATE_LIMITS.MAX_TOPIC_LENGTH} characters or less.`); return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/debate/start', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, mode }),
      })
      if (res.status === 201) { const d = await res.json(); router.push(`/debate/${d.sessionId}`); return }
      if (res.status === 422) {
        const d = await res.json()
        switch (d.error) {
          case 'QUOTA_EXHAUSTED': setShowUpgrade(true); break
          case 'CONCURRENCY_LIMIT': setError(`You already have ${DEBATE_LIMITS.MAX_CONCURRENT_DEBATES} active sessions.`); break
          case 'TOPIC_EMPTY': setError('Please enter a topic or idea.'); break
          case 'TOPIC_TOO_LONG': setError(`Topic/Idea must be ${DEBATE_LIMITS.MAX_TOPIC_LENGTH} characters or less.`); break
          default: setError(d.error ?? 'Something went wrong.')
        }
        return
      }
      setError('Something went wrong. Please try again.')
    } catch { setError('Network error. Please check your connection.') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-28 overflow-hidden bg-background">
      {/* Fine grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '24px 24px',
        maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 0%, transparent 80%)',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-xl relative z-10"
      >
        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-mono text-white/30 hover:text-white/70 transition-colors mb-8 group uppercase tracking-widest"
        >
          <ChevronLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/25 mb-3">
            // NEW_SESSION
          </p>
          <h1 className="text-2xl font-bold text-white/90 font-mono tracking-tight uppercase mb-2">
            Start a Session
          </h1>
          <p className="text-xs font-mono text-white/35">
            Enter a topic or idea. The AI models will discuss it.
          </p>
        </div>

        {/* Form */}
        <motion.div
          animate={{
            borderColor: focused ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)',
            boxShadow: focused ? '0 0 0 1px rgba(255,255,255,0.06)' : 'none',
          }}
          transition={{ duration: 0.2 }}
          className="relative overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Animated top line on focus */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-px"
            animate={{ opacity: focused ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }}
          />

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-white/70">
                <input type="radio" value="debate" checked={mode === 'debate'} onChange={() => setMode('debate')} className="accent-white/80" />
                Debate
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-white/70">
                <input type="radio" value="analysis" checked={mode === 'analysis'} onChange={() => setMode('analysis')} className="accent-white/80" />
                Idea Analysis
              </label>
            </div>
            <div>
              <label htmlFor="topic" className="block text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 mb-3">
                {mode === 'debate' ? 'Topic' : 'Idea'}
              </label>
              <textarea
                id="topic"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                maxLength={DEBATE_LIMITS.MAX_TOPIC_LENGTH}
                placeholder="e.g. Remote work is better than office work"
                rows={5}
                disabled={loading}
                className="w-full px-4 py-3 text-sm font-mono text-white/80 placeholder-white/20 resize-none focus:outline-none disabled:opacity-50 transition-colors duration-200"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              />
              {/* Progress bar */}
              <div className="mt-2.5 flex items-center gap-3">
                <div className="flex-1 h-px overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    className="h-full"
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 0.15 }}
                    style={{
                      background: isNearLimit ? 'rgba(248,113,113,0.7)' : 'rgba(255,255,255,0.4)',
                    }}
                  />
                </div>
                <span className="text-[10px] font-mono" style={{ color: isNearLimit ? 'rgba(248,113,113,0.8)' : 'rgba(255,255,255,0.2)' }}>
                  {charCount}/{DEBATE_LIMITS.MAX_TOPIC_LENGTH}
                </span>
              </div>
            </div>

            {/* Error / upgrade messages */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-4 py-3 text-xs font-mono text-red-400/80"
                  style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}
                >
                  {error}
                </motion.div>
              )}
              {showUpgrade && (
                <motion.div
                  key="upgrade"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-4 py-3 text-xs font-mono"
                  style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', color: 'rgba(251,191,36,0.8)' }}
                >
                  You&apos;ve used all your sessions this month.{' '}
                  <Link href="/sign-up" className="underline hover:opacity-80 transition-opacity">
                    Upgrade to continue →
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading || charCount === 0}
              className="btn-primary w-full flex items-center justify-center gap-2.5 py-3 text-xs disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <div className="size-3.5 rounded-full border border-black/30 border-t-black/80 animate-spin" />
                  Starting…
                </>
              ) : (
                <>
                  Start Session
                  <ChevronRight className="size-3.5" />
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Agent legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-4 grid grid-cols-2 gap-px bg-white/[0.06]"
        >
          {[
            { label: 'FOR',     name: 'Gemini' },
            { label: 'AGAINST', name: 'Grok'   },
          ].map(a => (
            <div key={a.label} className="px-4 py-3 text-center bg-background" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/25 mb-1">{a.label}</p>
              <p className="text-xs font-mono text-white/55">{a.name}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
