'use client'

import { useEffect, useRef, useState } from 'react'

interface UsageBarProps { used: number; limit: number }

export function UsageBar({ used, limit }: UsageBarProps) {
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0
  const [animPct, setAnimPct] = useState(0)
  const started = useRef(false)
  const barRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = barRef.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        const dur = 900
        const start = performance.now()
        const tick = (now: number) => {
          const p = Math.min((now - start) / dur, 1)
          const ease = 1 - Math.pow(1 - p, 3)
          setAnimPct(ease * pct)
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [pct])

  const fill = pct >= 100
    ? 'rgba(248,113,113,0.8)'
    : pct >= 80
      ? 'rgba(251,191,36,0.8)'
      : 'rgba(255,255,255,0.7)'

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono uppercase tracking-widest text-white/35">Monthly Usage</p>
        <p className="text-xs font-mono">
          <span className="text-white/80 font-bold">{used}</span>
          <span className="text-white/25"> / {limit}</span>
        </p>
      </div>

      <div
        ref={barRef}
        className="relative h-1.5 w-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        <div
          className="h-full transition-none"
          style={{
            width: `${animPct}%`,
            background: fill,
            transition: 'width 0.05s linear',
          }}
        />
        {/* Shimmer */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2.5s linear infinite',
        }} />
      </div>

      <div className="flex justify-between text-[10px] font-mono text-white/20 uppercase tracking-widest">
        <span>0</span>
        <span>{Math.round(pct)}% used</span>
        <span>{limit}</span>
      </div>
    </div>
  )
}
