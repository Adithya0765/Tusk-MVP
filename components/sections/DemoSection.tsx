'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { motion } from 'motion/react'

const DEMO_TOPIC = 'Should AI replace human judges in courtrooms?'

const TURNS = [
  {
    agent: 'A' as const, agentName: 'Qwen 3', round: 1, label: 'PRO',
    content: "AI judges would eliminate human bias from sentencing. Studies show outcomes vary based on the judge's mood, race of the defendant, and time of day. An AI trained on consistent legal principles would apply the law uniformly — equal treatment regardless of who stands before the bench.",
  },
  {
    agent: 'B' as const, agentName: 'Llama 3.1', round: 1, label: 'CON',
    content: "Justice requires human empathy and contextual understanding no AI can replicate. A judge must weigh remorse, life circumstances, and the human story behind each case. Algorithmic sentencing risks encoding historical biases at scale — perpetuating systemic inequalities rather than correcting them.",
  },
  {
    agent: 'A' as const, agentName: 'Qwen 3', round: 2, label: 'PRO',
    content: "The bias concern is valid but solvable through careful dataset curation and ongoing audits — unlike human bias, which is invisible and unauditable. AI systems can be transparent: every decision can be explained, logged, and challenged. Human judges operate as black boxes.",
  },
]

const VERDICT = {
  summary: 'The discussion reveals a genuine tension between consistency and humanity in judicial decision-making. While AI offers measurable advantages in eliminating mood-based bias, it cannot yet replicate the contextual moral reasoning that justice demands.',
  forPoints: ['Eliminates documented human biases', 'Every decision is fully auditable', 'Hybrid model preserves human oversight'],
  againstPoints: ['Risk of encoding historical biases at scale', 'Lacks empathy and moral reasoning', 'Democratic right to human judgment'],
  verdict: 'AI should augment, not replace, human judges. A recommended-sentence model with mandatory human review offers consistency while preserving the humanity justice requires.',
  confidence: 'High',
}

export function DemoSection() {
  return (
    <section className="py-24 md:py-36 relative overflow-hidden bg-black">
      <div className="absolute top-0 left-0 right-0 h-px" style={{
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
      }} />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 relative z-10 flex flex-col items-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" as any }}
          className="mb-16 text-center max-w-2xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-widest text-[#a8b1ff] shadow-lg">
            <span className="size-1.5 rounded-full bg-[#a8b1ff] animate-pulse" />
            Live Example
          </div>
          <h2 className="text-4xl md:text-5xl font-semibold text-white/95 tracking-tight mb-4" style={{ letterSpacing: '-0.02em' }}>
            See a real session
          </h2>
          <p className="text-base md:text-lg text-white/50 leading-relaxed">
            Here's what TUSK produces for a single topic. We treat AI agents like dedicated team members in a professional conference format.
          </p>
        </motion.div>

        {/* App Window UI */}
        <motion.div 
          initial={{ opacity: 0, y: 40, outline: 'none' }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/80 ring-1 ring-white/10 bg-[#0a0a0a] flex flex-col mx-auto max-w-5xl"
        >
          {/* Top Bar (Browser/OS theme) */}
          <div className="h-14 border-b border-white/5 bg-white/[0.02] flex items-center px-4 justify-between shrink-0">
            <div className="flex items-center gap-2 w-32">
              <div className="size-3 rounded-full bg-white/10 flex items-center justify-center overflow-hidden"><div className="size-full hover:bg-[#ff5f56] transition-colors rounded-full" /></div>
              <div className="size-3 rounded-full bg-white/10 flex items-center justify-center overflow-hidden"><div className="size-full hover:bg-[#ffbd2e] transition-colors rounded-full" /></div>
              <div className="size-3 rounded-full bg-white/10 flex items-center justify-center overflow-hidden"><div className="size-full hover:bg-[#27c93f] transition-colors rounded-full" /></div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="px-4 py-1.5 bg-black/40 rounded-md border border-white/5 text-xs text-white/60 font-medium flex items-center gap-2 max-w-[200px] sm:max-w-md truncate shadow-inner">
                <span className="truncate">Meeting: {DEMO_TOPIC}</span>
              </div>
            </div>
            <div className="w-32 flex justify-end">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#27c93f]/80 flex items-center gap-1.5 bg-[#27c93f]/10 px-2 py-0.5 rounded border border-[#27c93f]/20">
                <span className="size-1.5 rounded-full bg-[#27c93f] animate-pulse"></span>
                Recording
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row relative min-h-[500px]">
            {/* Main Video Area Mock */}
            <div className="flex-1 p-4 sm:p-6 flex flex-col bg-[#050505] relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full flex-1 z-10">
                {[
                  { id: 'A', name: 'Qwen 3',    label: 'Analyst', color: 'from-blue-500/10 to-blue-900/5', border: 'border-blue-500/20', accent: 'bg-blue-500', text: TURNS[2].content },
                  { id: 'B', name: 'Llama 3.1', label: 'Critic',  color: 'from-orange-500/10 to-orange-900/5', border: 'border-orange-500/20', accent: 'bg-orange-500', text: TURNS[1].content }
                ].map((agent) => (
                  <div key={agent.id} className={`relative rounded-xl overflow-hidden bg-black border ${agent.border} flex flex-col items-center justify-start p-6 shadow-xl w-full max-w-sm mx-auto`}>
                    <div className={`absolute inset-0 bg-gradient-to-b ${agent.color} opacity-30 pointer-events-none`} />
                    
                    {/* Centered Avatar */}
                    <div className="relative z-10 size-24 md:size-28 rounded-full bg-[#0a0a0a] ring-1 ring-white/10 flex items-center justify-center shadow-2xl mt-4 lg:mt-8 group-hover:scale-105 transition-transform duration-500">
                      <div className={`absolute inset-0 rounded-full ${agent.accent} opacity-15 blur-xl block animate-pulse`} style={{ animationDuration: '3s' }} />
                      <span className="text-3xl md:text-5xl font-light text-white/90">{agent.name[0]}</span>
                    </div>

                    <div className="z-10 mt-5 flex flex-col items-center">
                      <p className="text-white/90 font-medium text-lg tracking-tight">{agent.name}</p>
                      <span className="text-[9px] uppercase text-white/50 font-mono tracking-widest px-2 py-0.5 rounded-full border border-white/5 bg-white/5 mt-1">{agent.label}</span>
                    </div>

                    {/* Output Bubble */}
                    <div className="w-full mt-auto text-[13px] text-white/70 leading-relaxed z-10 bg-white/[0.03] p-4 rounded-xl border border-white/5 shadow-inner mt-6">
                      <span className="line-clamp-4">{agent.text}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Controls Bar */}
              <div className="mt-6 flex items-center justify-center h-16 shrink-0 z-10">
                <div className="px-1.5 py-1.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-1 backdrop-blur-2xl shadow-xl">
                  {['🎤', '📹', '✋'].map((emoji, i) => (
                    <div key={i} className="size-10 rounded-xl flex items-center justify-center text-base text-white/50 hover:bg-white/10 hover:text-white transition-colors cursor-not-allowed">
                      {emoji}
                    </div>
                  ))}
                  <div className="w-px h-6 bg-white/10 mx-2" />
                  <div className="px-5 h-10 ml-1 rounded-lg bg-[#e5484d] hover:bg-[#ff5f56] transition-colors text-[13px] font-semibold text-white shadow-lg flex items-center cursor-not-allowed">
                    Leave
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Chat Mock */}
            <div className="w-full md:w-[320px] lg:w-[360px] border-t md:border-t-0 md:border-l border-white/5 flex flex-col bg-[#0a0a0a] shrink-0 z-20">
              <div className="p-4 border-b border-white/5 flex items-center justify-between shadow-sm bg-black/20 shrink-0">
                <h2 className="text-[13px] font-medium text-white/90">Meeting Chat</h2>
                <div className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-white/50 font-mono border border-white/5">
                  {TURNS.length} msgs
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {TURNS.map((t, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.15 }}
                  >
                    <div className="flex gap-3">
                      <div className="size-7 rounded-sm bg-white/[0.03] border border-white/5 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                        <span className="text-[11px] font-medium text-white/70">{t.agentName[0]}</span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-baseline gap-2 mb-1 shrink-0">
                          <span className="text-[13px] font-medium text-white/90">{t.agentName}</span>
                          <span className="text-[10px] text-white/30 font-mono tabular-nums">12:0{i} PM</span>
                        </div>
                        <div className="text-[13px] text-white/60 leading-relaxed word-break break-words mt-1 hover:text-white/80 transition-colors">
                          {t.content}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="p-4 border-t border-white/5 shrink-0 bg-[#050505]">
                <div className="h-10 rounded-lg bg-white/[0.03] border border-white/5 flex items-center px-3 text-[13px] text-white/30 cursor-not-allowed shadow-inner">
                  Type a message...
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Verdict below the window */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
          className="mt-6 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Executive Summary */}
          <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl p-6 lg:p-8 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#a8b1ff] mb-4 bg-[#a8b1ff]/10 border border-[#a8b1ff]/20 px-2 py-0.5 rounded-full">
                Executive Recap
              </div>
              <p className="text-sm leading-relaxed text-white/70">
                {VERDICT.summary}
              </p>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#27c93f]/80 mb-2 block">Final Consensus</span>
              <p className="text-[#27c93f]/90 bg-[#27c93f]/10 p-4 rounded-xl border border-[#27c93f]/20 text-[13px] leading-relaxed shadow-inner font-medium">
                {VERDICT.verdict}
              </p>
            </div>
          </div>

          {/* Pros / Cons Map */}
          <div className="rounded-2xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl p-6 lg:p-8 shadow-2xl flex flex-col gap-6">
            <div className="flex-1 p-5 rounded-xl bg-black/40 border border-white/5 shadow-inner">
               <p className={`text-[10px] font-mono uppercase tracking-widest text-[#a8b1ff] mb-4 flex items-center gap-2`}><span className="size-1.5 rounded-full bg-[#a8b1ff]"></span> Strengths identified</p>
               <ul className="space-y-3">
                 {VERDICT.forPoints.map((pt, i) => (
                   <li key={i} className="flex gap-3 items-start text-[13px] text-white/60">
                     <span className="text-white/20 select-none font-mono">-</span>
                     <span className="leading-relaxed">{pt}</span>
                   </li>
                 ))}
               </ul>
            </div>

            <div className="flex-1 p-5 rounded-xl bg-black/40 border border-white/5 shadow-inner">
               <p className={`text-[10px] font-mono uppercase tracking-widest text-orange-400 mb-4 flex items-center gap-2`}><span className="size-1.5 rounded-full bg-orange-400"></span> Challenges raised</p>
               <ul className="space-y-3">
                 {VERDICT.againstPoints.map((pt, i) => (
                   <li key={i} className="flex gap-3 items-start text-[13px] text-white/60">
                     <span className="text-white/20 select-none font-mono">-</span>
                     <span className="leading-relaxed">{pt}</span>
                   </li>
                 ))}
               </ul>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-12 text-center"
        >
          <Link
            href="/debate/new"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white text-black hover:bg-white/90 font-medium transition-all shadow-xl hover:shadow-white/20 hover:scale-105 active:scale-95 text-sm"
          >
            Start a Session
            <ArrowRight className="size-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
