'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'

/* ─── Matrix-style rain canvas ─── */
function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%\"\'#&_(),.;:?!\\|{}<>[]^~'
    const cellSize = 16
    let cols = 0
    const drops: number[] = []

    function resize() {
      canvas!.width  = window.innerWidth
      canvas!.height = window.innerHeight
      cols = Math.ceil(canvas!.width / cellSize)
      drops.length = 0
      for (let i = 0; i < cols; i++) drops[i] = Math.random() * -100
    }
    resize()
    window.addEventListener('resize', resize, { passive: true })

    let last = 0
    function draw(t: number) {
      animId = requestAnimationFrame(draw)
      if (t - last < 1000 / 30) return // slightly faster update
      last = t
      if (!canvas || !ctx) return

      // Darker fade for a more profound "trail" effect
      ctx.fillStyle = 'rgba(10,10,15,0.08)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.font = `bold 14px "Geist Mono", monospace` // louder font
      ctx.textAlign = 'center'

      for (let i = 0; i < cols; i++) {
        const ch = chars[Math.floor(Math.random() * chars.length)]
        const y  = drops[i] * cellSize
        // Varying bright green and white colors for profound Matrix feel
        const a  = Math.random() * 0.4 + 0.1
        const color = Math.random() > 0.85 ? `rgba(255,255,255,${a + 0.2})` : `rgba(0, 255, 65, ${a})`
        ctx.fillStyle = color
        ctx.fillText(ch, i * cellSize + cellSize / 2, y)
        if (y > canvas.height && Math.random() > 0.95) drops[i] = 0
        drops[i] += 1.0 // slightly faster fall
      }
    }
    draw(0)
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      {/* Vignette so text stays readable */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(10,10,15,0.55) 0%, rgba(10,10,15,0.85) 100%)',
      }} />
    </div>
  )
}

/* ─── Typewriter hook ─── */
function useTypewriter(words: string[], speed = 60, pause = 1800) {
  const [display, setDisplay] = useState('')
  const [wordIdx, setWordIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const word = words[wordIdx]
    const delay = deleting
      ? speed / 2
      : charIdx === word.length ? pause : speed

    const t = setTimeout(() => {
      if (!deleting && charIdx < word.length) {
        setDisplay(word.slice(0, charIdx + 1))
        setCharIdx(c => c + 1)
      } else if (!deleting && charIdx === word.length) {
        setDeleting(true)
      } else if (deleting && charIdx > 0) {
        setDisplay(word.slice(0, charIdx - 1))
        setCharIdx(c => c - 1)
      } else {
        setDeleting(false)
        setWordIdx(i => (i + 1) % words.length)
      }
    }, delay)
    return () => clearTimeout(t)
  }, [charIdx, deleting, wordIdx, words, speed, pause])

  return display
}

/* ─── Animated counter ─── */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        const dur = 1200
        const start = performance.now()
        const tick = (now: number) => {
          const p = Math.min((now - start) / dur, 1)
          const ease = 1 - Math.pow(1 - p, 3)
          setVal(Math.round(ease * to))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [to])

  return <span ref={ref}>{val}{suffix}</span>
}

/* ─── Floating debate preview card — magnetic ─── */
function DebatePreviewCard() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x)
  const mouseYSpring = useSpring(y)

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"])

  function onMouseMove(e: React.MouseEvent) {
    const el = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - el.left) / el.width - 0.5)
    y.set((e.clientY - el.top) / el.height - 0.5)
  }

  function onMouseLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <div
      className="absolute right-8 top-1/2 -translate-y-1/2 w-64 hidden xl:block pointer-events-auto"
      style={{ zIndex: 8, perspective: '1000px' }}
    >
      <motion.div
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: -10, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" as any }}
        className="relative rounded-xl overflow-hidden"
        style={{
          background: 'rgba(16,16,22,0.92)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px" style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        }} />

        <div className="p-4 space-y-2.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Active Debate</span>
            <span className="flex items-center gap-1.5">
              <span className="relative size-1.5">
                <motion.span 
                  animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-emerald-400" 
                />
                <span className="relative size-1.5 rounded-full bg-emerald-400 block" />
              </span>
              <span className="text-[10px] text-emerald-400/70 font-mono">LIVE</span>
            </span>
          </div>

          {[
            { label: 'FOR',     agent: 'Gemini', text: 'AI judges eliminate human bias. Sentencing varies by mood and time of day…' },
            { label: 'AGAINST', agent: 'Grok',   text: 'Justice requires empathy no algorithm can replicate…' },
          ].map((t, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.15, duration: 0.5 }}
              className="rounded-lg p-3" style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded text-white/70 font-mono" style={{ background: 'rgba(255,255,255,0.08)' }}>{t.label}</span>
                <span className="text-[10px] text-white/40 font-mono">{t.agent}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-white/60">{t.text}</p>
            </motion.div>
          ))}

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="rounded-lg p-3" style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-mono uppercase tracking-wider text-white/35">Verdict</span>
              <span className="text-[9px] text-white/50 font-mono">High confidence</span>
            </div>
            <p className="text-[11px] text-white/55 leading-relaxed">AI should augment, not replace, human judges…</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

/* ─── Hero ─── */
export function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  const typed = useTypewriter(
    ['any topic.', 'a policy debate.', 'a tech argument.', 'a moral dilemma.', 'a business case.'],
    55, 2000
  )

  useEffect(() => {
    // Stagger mount so animations fire after hydration
    const t = setTimeout(() => setMounted(true), 80)
    return () => clearTimeout(t)
  }, [])

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 })
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 })
  const xTransform = useTransform(smoothX, [-0.5, 0.5], [-15, 15])
  const yTransform = useTransform(smoothY, [-0.5, 0.5], [-15, 15])

  const onMove = useCallback((e: MouseEvent) => {
    if (!heroRef.current) return
    const r = heroRef.current.getBoundingClientRect()
    mouseX.set((e.clientX - r.left) / r.width - 0.5)
    mouseY.set((e.clientY - r.top) / r.height - 0.5)
  }, [mouseX, mouseY])

  useEffect(() => {
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [onMove])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as any } }
  }

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background"
    >
      {/* Fine grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '24px 24px',
        maskImage: 'radial-gradient(ellipse 90% 70% at 50% 0%, black 0%, transparent 80%)',
        zIndex: 0,
      }} />

      {/* Matrix rain */}
      <MatrixRain />

      {/* Floating card */}
      <DebatePreviewCard />

      {/* Main content */}
      {mounted && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 text-center px-6 max-w-4xl mx-auto"
          style={{ x: xTransform, y: yTransform }}
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-mono mb-8 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              <span className="relative size-1.5">
                <motion.span 
                  animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-white" 
                />
                <span className="relative size-1.5 rounded-full bg-white/50 block" />
              </span>
              AI-POWERED DEBATE ANALYSIS
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={itemVariants} className="font-semibold mb-6" style={{ letterSpacing: '-0.04em' }}>
            <span className="block text-white" style={{ fontSize: 'clamp(2.8rem,7.5vw,6rem)', lineHeight: 1.0 }}>
              Submit
            </span>
            {/* Typewriter line */}
            <span
              className="block text-gradient"
              style={{ fontSize: 'clamp(2.8rem,7.5vw,6rem)', lineHeight: 1.05, minHeight: '1.05em' }}
            >
              {typed}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block w-0.5 h-[0.85em] bg-white/70 ml-1 align-middle"
              />
            </span>
            <span className="block text-white/60" style={{ fontSize: 'clamp(2.8rem,7.5vw,6rem)', lineHeight: 1.0 }}>
              Get a verdict.
            </span>
          </motion.h1>

          {/* Sub */}
          <motion.p variants={itemVariants} className="text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed font-mono text-white/40">
            Two frontier AI models argue opposing sides across multiple rounds.
            Receive a structured conclusion with key points and a final verdict.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-14">
            <Link href="/debate/new" className="btn-primary inline-flex items-center gap-2 px-7 py-3 text-sm transition-transform hover:scale-105 active:scale-95">
              START A DEBATE
              <ArrowRight className="size-4" />
            </Link>
            <Link href="#how-it-works" className="btn-ghost inline-flex items-center gap-2 px-7 py-3 text-sm transition-transform hover:scale-105 active:scale-95">
              HOW IT WORKS
            </Link>
          </motion.div>

          {/* Animated stats */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-8">
            {[
              { to: 24,   suffix: '/7',  label: 'availability' },
              { to: 2,   suffix: '',  label: 'AI models' },
              { to: 100, suffix: '%', label: 'structured output' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold text-white/90 font-mono tracking-tight">
                  <Counter to={s.to} suffix={s.suffix} />
                </div>
                <div className="text-xs font-mono text-white/30 mt-0.5 uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{
        background: 'linear-gradient(to bottom, transparent, #0a0a0f)',
        zIndex: 10,
      }} />

      {/* Scroll cue */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <div className="w-4 h-7 rounded-full flex items-start justify-center pt-1.5" style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-0.5 h-1.5 rounded-full bg-white/40" 
          />
        </div>
      </motion.div>
    </section>
  )
}
