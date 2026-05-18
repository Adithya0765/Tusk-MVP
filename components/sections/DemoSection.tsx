'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { motion } from 'motion/react'

const DEMO_TOPIC = 'Should AI replace human judges in courtrooms?'

const TURNS = [
  {
    agent: 'A' as const, agentName: 'Gemini', round: 1, label: 'FOR',
    content: "AI judges would eliminate human bias from sentencing. Studies show outcomes vary based on the judge's mood, race of the defendant, and time of day. An AI trained on consistent legal principles would apply the law uniformly — equal treatment regardless of who stands before the bench.",
  },
  {
    agent: 'B' as const, agentName: 'Grok', round: 1, label: 'AGAINST',
    content: "Justice requires human empathy and contextual understanding no AI can replicate. A judge must weigh remorse, life circumstances, and the human story behind each case. Algorithmic sentencing risks encoding historical biases at scale — perpetuating systemic inequalities rather than correcting them.",
  },
  {
    agent: 'A' as const, agentName: 'Gemini', round: 2, label: 'FOR',
    content: "The bias concern is valid but solvable through careful dataset curation and ongoing audits — unlike human bias, which is invisible and unauditable. AI systems can be transparent: every decision can be explained, logged, and challenged. Human judges operate as black boxes.",
  },
]

const VERDICT = {
  summary: 'The debate reveals a genuine tension between consistency and humanity in judicial decision-making. While AI offers measurable advantages in eliminating mood-based bias, it cannot yet replicate the contextual moral reasoning that justice demands.',
  forPoints: ['Eliminates documented human biases', 'Every decision is fully auditable', 'Hybrid model preserves human oversight'],
  againstPoints: ['Risk of encoding historical biases at scale', 'Lacks empathy and moral reasoning', 'Democratic right to human judgment'],
  verdict: 'AI should augment, not replace, human judges. A recommended-sentence model with mandatory human review offers consistency while preserving the humanity justice requires.',
  confidence: 'High',
}

function TurnCard({ turn, index }: { turn: typeof TURNS[0]; index: number }) {
  const isFor = turn.agent === 'A'

  return (
    <motion.div
      initial={{ opacity: 0, x: isFor ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1], delay: index * 0.15 }}
      className={`flex ${isFor ? 'justify-start' : 'justify-end'}`}
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="relative max-w-[85%] rounded-xl p-5 bg-white/[0.015] border border-white/[0.04] shadow-sm hover:shadow-lg hover:border-white/[0.08]"
      >
        <div className="flex items-center gap-2.5 mb-3 border-b border-white/[0.05] pb-2">
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-md text-white/60 bg-white/[0.03] border border-white/[0.05]"
          >
            {turn.label}
          </span>
          <span className="text-xs text-white/40">{turn.agentName}</span>
          <span className="text-[10px] font-mono text-white/30 ml-auto">Round {turn.round}</span>
        </div>
        <p className="text-sm leading-relaxed text-white/70">{turn.content}</p>
      </motion.div>
    </motion.div>
  )
}

export function DemoSection() {
  return (
    <section className="py-24 md:py-36 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px" style={{
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
      }} />

      <div className="mx-auto max-w-3xl px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" as any }}
          className="mb-12"
        >
          <p className="text-xs font-mono uppercase tracking-widest text-white/30 mb-4">Sample output</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-white/90 tracking-tight" style={{ letterSpacing: '-0.03em' }}>
            See a real debate
          </h2>
          <p className="mt-3 text-sm text-white/40">Here's what TUSK produces for a single topic.</p>
        </motion.div>

        {/* Topic */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-xl p-4 mb-6"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-1.5">Topic</p>
          <p className="text-sm font-medium text-white/80">{DEMO_TOPIC}</p>
        </motion.div>

        {/* Turns */}
        <div className="space-y-3 mb-8">
          {TURNS.map((t, i) => <TurnCard key={i} turn={t} index={i} />)}
        </div>

        {/* Verdict */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1], delay: 0.3 }}
          className="rounded-xl overflow-hidden shadow-2xl shadow-black/40"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.09)',
          }}
        >
          {/* Top accent */}
          <div className="h-px" style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
          }} />

          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="text-xs font-mono uppercase tracking-widest text-white/35">AI Verdict</p>
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded text-white/50"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {VERDICT.confidence} confidence
              </span>
            </div>

            {/* Summary */}
            <div className="rounded-lg p-4 mb-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="text-[10px] font-mono uppercase tracking-widest text-white/25 mb-2">Summary</p>
              <p className="text-sm leading-relaxed text-white/60">{VERDICT.summary}</p>
            </div>

            {/* For / Against */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              {[
                { title: 'Key Points FOR', pts: VERDICT.forPoints },
                { title: 'Key Points AGAINST', pts: VERDICT.againstPoints },
              ].map(({ title, pts }, idx) => (
                <motion.div 
                  key={title} 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + idx * 0.1, duration: 0.5 }}
                  className="rounded-lg p-4" 
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <p className="text-[10px] font-mono uppercase tracking-widest text-white/25 mb-3">{title}</p>
                  <ul className="space-y-2">
                    {pts.map((pt, i) => (
                      <li key={i} className="flex gap-2 text-xs text-white/55">
                        <CheckCircle2 className="size-3.5 shrink-0 mt-0.5 text-white/25" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            {/* Final verdict */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="rounded-lg p-4" 
              style={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <p className="text-[10px] font-mono uppercase tracking-widest text-white/25 mb-2">Final Verdict</p>
              <p className="text-sm leading-relaxed text-white/70 font-medium">{VERDICT.verdict}</p>
            </motion.div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-8 text-center"
        >
          <Link
            href="/debate/new"
            className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-transform hover:scale-105 active:scale-95"
          >
            Run your own debate
            <ArrowRight className="size-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
