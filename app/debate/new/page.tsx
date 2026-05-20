'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DEBATE_LIMITS, type ModelConfig, type ModelId } from '@/types/index'
import { ChevronRight, ChevronLeft, Lock, Sparkles, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

const TIER_BADGE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  free:    { label: 'Free',      color: 'rgba(255,255,255,0.4)',  bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' },
  starter: { label: 'Community', color: 'rgba(96,165,250,0.8)',   bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.2)'  },
  pro:     { label: 'Pro',       color: 'rgba(251,191,36,0.9)',   bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)'  },
}

export default function NewDebatePage() {
  const router = useRouter()
  const [topic, setTopic] = useState('')
  const [mode, setMode] = useState<'debate' | 'analysis'>('debate')
  const [selectedModelId, setSelectedModelId] = useState<ModelId | null>(null)
  const [availableModels, setAvailableModels] = useState<ModelConfig[]>([])
  const [userTier, setUserTier] = useState<string>('free')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [focused, setFocused] = useState(false)

  const charCount = topic.length
  const isNearLimit = charCount > 450
  const progress = (charCount / DEBATE_LIMITS.MAX_TOPIC_LENGTH) * 100

  // Fetch available models for the user's tier
  useEffect(() => {
    fetch('/api/models')
      .then(r => r.json())
      .then(data => {
        setAvailableModels(data.models ?? [])
        setUserTier(data.tier ?? 'free')
        // Default to first available model
        if (data.models?.length > 0) setSelectedModelId(data.models[0].id)
      })
      .catch(() => {})
  }, [])

  const selectedModel = availableModels.find(m => m.id === selectedModelId)

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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, mode, modelId: selectedModelId }),
      })
      if (res.status === 201) { const d = await res.json(); router.push(`/debate/${d.sessionId}`); return }
      if (res.status === 403) { setShowUpgrade(true); return }
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

  // All models in catalogue for display (locked ones shown greyed out)
  const ALL_TIERS = ['free', 'starter', 'pro'] as const
  const tierOrder = ALL_TIERS
  const userTierIndex = tierOrder.indexOf(userTier as typeof ALL_TIERS[number])

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-28 overflow-hidden bg-background">
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
        className="w-full max-w-2xl relative z-10"
      >
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-mono text-white/30 hover:text-white/70 transition-colors mb-8 group uppercase tracking-widest"
        >
          <ChevronLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Dashboard
        </Link>

        <div className="mb-8">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/25 mb-3">// NEW_SESSION</p>
          <h1 className="text-2xl font-bold text-white/90 font-mono tracking-tight uppercase mb-2">
            {mode === 'debate' ? 'Start a Debate' : 'Refine an Idea'}
          </h1>
          <p className="text-xs font-mono text-white/35">
            {mode === 'debate' ? 'Enter a topic. Two AI models will debate it.' : 'Enter an idea. Two agents will refine it into something bulletproof.'}
          </p>
        </div>

        <div className="space-y-4">
          {/* Topic form */}
          <motion.div
            animate={{
              borderColor: focused ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)',
              boxShadow: focused ? '0 0 0 1px rgba(255,255,255,0.06)' : 'none',
            }}
            transition={{ duration: 0.2 }}
            className="relative overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <motion.div
              className="absolute top-0 left-0 right-0 h-px"
              animate={{ opacity: focused ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }}
            />

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Mode selector */}
              <div className="flex gap-4">
                {(['debate', 'analysis'] as const).map(m => (
                  <label key={m} className="flex items-center gap-2 cursor-pointer text-xs font-mono text-white/70">
                    <input type="radio" value={m} checked={mode === m} onChange={() => setMode(m)} className="accent-white/80" />
                    {m === 'debate' ? 'Debate' : 'Idea Refinement'}
                  </label>
                ))}
              </div>

              {/* Topic input */}
              <div>
                <label htmlFor="topic" className="block text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 mb-3">
                  {mode === 'debate' ? 'Topic' : 'Idea to refine'}
                </label>
                <textarea
                  id="topic"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  maxLength={DEBATE_LIMITS.MAX_TOPIC_LENGTH}
                  placeholder={mode === 'debate'
                    ? 'e.g. Remote work is better than office work'
                    : 'e.g. A subscription box for indie board game designers'}
                  rows={4}
                  disabled={loading}
                  className="w-full px-4 py-3 text-sm font-mono text-white/80 placeholder-white/20 resize-none focus:outline-none disabled:opacity-50 transition-colors duration-200"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                />
                <div className="mt-2.5 flex items-center gap-3">
                  <div className="flex-1 h-px overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div
                      className="h-full"
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      transition={{ duration: 0.15 }}
                      style={{ background: isNearLimit ? 'rgba(248,113,113,0.7)' : 'rgba(255,255,255,0.4)' }}
                    />
                  </div>
                  <span className="text-[10px] font-mono" style={{ color: isNearLimit ? 'rgba(248,113,113,0.8)' : 'rgba(255,255,255,0.2)' }}>
                    {charCount}/{DEBATE_LIMITS.MAX_TOPIC_LENGTH}
                  </span>
                </div>
              </div>

              {/* Errors */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div key="error" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                    className="px-4 py-3 text-xs font-mono text-red-400/80"
                    style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
                    {error}
                  </motion.div>
                )}
                {showUpgrade && (
                  <motion.div key="upgrade" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                    className="px-4 py-3 text-xs font-mono"
                    style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', color: 'rgba(251,191,36,0.8)' }}>
                    This model requires a higher plan, or you&apos;ve used all your sessions.{' '}
                    <Link href="/pricing" className="underline hover:opacity-80 transition-opacity">Upgrade →</Link>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading || charCount === 0}
                className="btn-primary w-full flex items-center justify-center gap-2.5 py-3 text-xs disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <><div className="size-3.5 rounded-full border border-black/30 border-t-black/80 animate-spin" />Starting…</>
                ) : (
                  <>Start Session<ChevronRight className="size-3.5" /></>
                )}
              </button>
            </form>
          </motion.div>

          {/* Model picker */}
          <div style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.015)' }}>
            <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/35">Select Model</p>
              {selectedModel && (
                <span className="text-[10px] font-mono text-white/30">
                  {selectedModel.agentAModel.split('/').pop()} vs {selectedModel.agentBModel.split('/').pop()}
                </span>
              )}
            </div>

            <div className="p-3 space-y-1.5">
              {availableModels.length === 0 ? (
                // Loading skeleton
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-14 animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
                ))
              ) : (
                availableModels.map(model => {
                  const isSelected = selectedModelId === model.id
                  const badge = TIER_BADGE[model.tier]
                  return (
                    <motion.button
                      key={model.id}
                      onClick={() => setSelectedModelId(model.id)}
                      whileHover={{ x: 2 }}
                      transition={{ duration: 0.15 }}
                      className="w-full text-left px-4 py-3 flex items-center gap-3 transition-colors"
                      style={{
                        background: isSelected ? 'rgba(255,255,255,0.06)' : 'transparent',
                        border: `1px solid ${isSelected ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)'}`,
                      }}
                    >
                      {/* Selected indicator */}
                      <div className="size-4 shrink-0 flex items-center justify-center" style={{
                        border: `1px solid ${isSelected ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)'}`,
                        background: isSelected ? 'rgba(255,255,255,0.1)' : 'transparent',
                      }}>
                        {isSelected && <Check className="size-2.5 text-white/80" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-mono text-white/80 font-semibold truncate">{model.label}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 uppercase tracking-wider shrink-0"
                            style={{ background: badge.bg, border: `1px solid ${badge.border}`, color: badge.color }}>
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-white/30 truncate">{model.description}</p>
                      </div>

                      <span className="text-[10px] font-mono text-white/20 shrink-0">{model.provider}</span>
                    </motion.button>
                  )
                })
              )}

              {/* Locked models teaser */}
              {userTier === 'free' && (
                <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <p className="text-[9px] font-mono uppercase tracking-widest text-white/20 px-4 mb-1.5">Unlock with Community or Pro</p>
                  {[
                    { label: 'Claude Haiku vs GPT-4o Mini', tier: 'Community' },
                    { label: 'Claude Sonnet vs GPT-4o', tier: 'Pro' },
                  ].map(m => (
                    <div key={m.label} className="px-4 py-2.5 flex items-center gap-3 opacity-40">
                      <Lock className="size-3.5 text-white/40 shrink-0" />
                      <span className="text-xs font-mono text-white/50 flex-1">{m.label}</span>
                      <span className="text-[9px] font-mono text-white/30">{m.tier}</span>
                    </div>
                  ))}
                  <Link href="/pricing" className="flex items-center gap-2 px-4 py-2.5 text-[10px] font-mono text-white/40 hover:text-white/70 transition-colors group">
                    <Sparkles className="size-3 text-white/30" />
                    View all plans
                    <ChevronRight className="size-3 group-hover:translate-x-0.5 transition-transform ml-auto" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
