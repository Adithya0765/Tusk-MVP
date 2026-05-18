'use client'

import Link from 'next/link'
import { ArrowRight, Zap, Shield, Globe, Eye } from 'lucide-react'
import { motion } from 'motion/react'

const VALUES = [
  { icon: Zap,    title: 'Speed',          desc: 'Debates complete in under 60 seconds. No waiting, no setup, no prompting.' },
  { icon: Shield, title: 'Transparency',   desc: 'Every argument is logged. Every verdict is explained. Nothing is a black box.' },
  { icon: Globe,  title: 'Accessibility',  desc: 'Sophisticated AI reasoning available to anyone — not just researchers or engineers.' },
  { icon: Eye,    title: 'Honesty',        desc: 'We give a real verdict. Not a diplomatic non-answer. The AI picks a side and defends it.' },
]

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }
const item = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }

export default function AboutPage() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-background">
      {/* Fine grid */}
      <div className="fixed inset-0 pointer-events-none -z-10" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
        maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 80%)',
      }} />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-4xl px-6 py-32 space-y-24"
      >
        {/* Hero */}
        <motion.div variants={item} className="max-w-2xl">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/25 mb-4">// ABOUT</p>
          <h1 className="text-4xl md:text-6xl font-bold text-white/90 font-mono tracking-tight leading-tight mb-6" style={{ letterSpacing: '-0.03em' }}>
            We built the<br />AI debate arena.
          </h1>
          <p className="text-base font-mono text-white/40 leading-relaxed">
            TUSK is a single-purpose tool: submit any topic, watch two frontier AI models argue it out,
            get a structured verdict. No fluff. No filler. Just the debate.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div
          variants={item}
          className="relative p-8 md:p-10 overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)' }}
        >
          <div className="absolute top-0 left-0 right-0 h-px" style={{
            background: 'linear-gradient(90deg, rgba(255,255,255,0.2) 0%, transparent 60%)',
          }} />
          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/25 mb-5">Mission</p>
          <p className="text-xl md:text-2xl font-mono text-white/75 leading-relaxed">
            "Make it trivially easy to see both sides of any argument — argued by the best AI models in the world."
          </p>
        </motion.div>

        {/* Why */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/25">Why we built this</p>
            <h2 className="text-2xl font-bold text-white/85 font-mono tracking-tight">The problem with one-sided AI</h2>
            <p className="text-sm font-mono text-white/40 leading-relaxed">
              Most AI tools give you one perspective. You ask a question, you get an answer.
              But the best thinking happens when ideas are challenged — when someone argues the other side.
            </p>
            <p className="text-sm font-mono text-white/40 leading-relaxed">
              TUSK automates that. One model argues FOR. Another argues AGAINST.
              They go at it for multiple rounds. You get a structured conclusion you can download and share.
            </p>
          </div>

          {/* Mini debate preview */}
          <div className="space-y-2">
            {[
              { label: 'FOR',     text: 'AI judges eliminate human bias. Every decision is auditable and explainable.' },
              { label: 'AGAINST', text: 'Justice requires empathy. Algorithms encode historical inequalities at scale.' },
            ].map((t, i) => (
              <motion.div
                key={t.label}
                initial={{ opacity: 0, x: i === 0 ? -16 : 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="p-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 mr-2 text-white/50" style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                }}>{t.label}</span>
                <span className="text-xs font-mono text-white/50">{t.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Values */}
        <motion.div variants={item}>
          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/25 mb-8">What we stand for</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/[0.06]">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
                transition={{ duration: 0.15 }}
                className="relative p-6 group"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center size-8" style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
                  }}>
                    <Icon className="size-4 text-white/40" />
                  </div>
                  <h3 className="text-sm font-bold text-white/75 font-mono uppercase tracking-wider">{title}</h3>
                </div>
                <p className="text-xs font-mono text-white/35 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div variants={item} className="text-center">
          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/25 mb-6">Ready?</p>
          <Link href="/debate/new" className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-sm">
            Start a debate
            <ArrowRight className="size-4" />
          </Link>
        </motion.div>

      </motion.div>
    </main>
  )
}
