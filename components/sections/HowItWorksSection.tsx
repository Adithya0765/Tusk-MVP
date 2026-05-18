'use client'

import { FileText, Zap, BarChart3 } from 'lucide-react'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'

const STEPS = [
  {
    num: '01', icon: FileText,
    title: 'Submit a topic',
    desc: 'Type any debatable topic — up to 500 characters. TUSK assigns one model the FOR position and another the AGAINST position automatically.',
  },
  {
    num: '02', icon: Zap,
    title: 'Models discuss',
    desc: 'The two models exchange arguments across multiple rounds. Each turn is focused and concise — no filler, just structured reasoning that builds round by round.',
  },
  {
    num: '03', icon: BarChart3,
    title: 'Receive the verdict',
    desc: 'Get a structured conclusion: executive summary, key points for and against, unresolved tensions, and a final verdict with confidence level. Export as PDF or Markdown.',
  },
]

function StepCard({ step, index }: { step: typeof STEPS[0]; index: number }) {
  const Icon = step.icon
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const mouseXSpring = useSpring(x)
  const mouseYSpring = useSpring(y)

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"])

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - r.left) / r.width - 0.5)
    y.set((e.clientY - r.top) / r.height - 0.5)
  }

  function onMouseLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      initial={{ opacity: 0, y: 40, rotateX: 0, rotateY: 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" as any, delay: index * 0.15 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: '700px',
      }}
      className="relative cursor-default h-full bg-background"
    >
      <motion.div
        whileHover="hover"
        initial="initial"
        className="relative p-6 h-full overflow-hidden flex flex-col group"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          transformStyle: 'preserve-3d',
        }}
        variants={{
          hover: {
            background: 'rgba(255,255,255,0.05)',
            borderColor: 'rgba(255,255,255,0.12)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 12px 40px rgba(0,0,0,0.4)',
          }
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Animated top border on hover */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
          }}
          variants={{
            initial: { opacity: 0 },
            hover: { opacity: 1 }
          }}
          transition={{ duration: 0.2 }}
        />

        {/* Step number */}
        <div className="text-[10px] font-mono text-white/20 mb-5 tracking-[0.2em] relative" style={{ transform: 'translateZ(10px)' }}>
          {step.num} / 03
        </div>

        {/* Icon with animated ring on hover */}
        <div className="relative inline-flex items-center justify-center size-11 mb-6" style={{ transform: 'translateZ(20px)' }}>
          <motion.div
            className="absolute inset-0"
            variants={{
              initial: { borderColor: 'rgba(255,255,255,0.07)' },
              hover: { borderColor: 'rgba(255,255,255,0.15)' }
            }}
            style={{
              border: '1px solid',
            }}
            transition={{ duration: 0.2 }}
          />
          {/* Spinning ring on hover */}
          <motion.div
            className="absolute -inset-1.5 rounded-sm"
            variants={{
              initial: { opacity: 0, rotate: 0 },
              hover: { opacity: 1, rotate: 360 }
            }}
            transition={{
              opacity: { duration: 0.2 },
              rotate: { duration: 3, repeat: Infinity, ease: "linear" }
            }}
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              borderTopColor: 'rgba(255,255,255,0.3)',
            }}
          />
          <Icon className="size-5 text-white/60 relative z-10" />
        </div>

        {/* Title */}
        <h3
          className="text-sm font-bold text-white/90 mb-3 uppercase tracking-wider font-mono"
          style={{ transform: 'translateZ(12px)' }}
        >
          {step.title}
        </h3>

        {/* Desc */}
        <p className="text-sm leading-relaxed text-white/40 font-mono" style={{ transform: 'translateZ(8px)' }}>
          {step.desc}
        </p>

        {/* Bottom-right ghost number */}
        <motion.div
          className="absolute bottom-3 right-4 font-mono font-bold pointer-events-none select-none"
          style={{
            fontSize: '5rem',
            lineHeight: 1,
            transform: 'translateZ(0px)',
          }}
          variants={{
            initial: { color: 'rgba(255,255,255,0.03)' },
            hover: { color: 'rgba(255,255,255,0.06)' }
          }}
          transition={{ duration: 0.3 }}
        >
          {step.num}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 md:py-36 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px" style={{
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)',
      }} />

      <div className="mx-auto max-w-5xl px-6 relative z-10">
        {/* Header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" as any }}
        >
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/25 mb-4">
            // HOW_IT_WORKS
          </p>
          <h2
            className="text-3xl md:text-4xl font-semibold text-white/90 max-w-lg font-mono"
            style={{ letterSpacing: '-0.02em' }}
          >
            From topic to structured verdict in seconds
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.04]">
          {STEPS.map((step, i) => (
            <StepCard key={i} step={step} index={i} />
          ))}
        </div>

        {/* Animated connector line */}
        <div className="hidden md:flex items-center mt-8 px-6 gap-0">
          {STEPS.map((_, i) => (
            <div key={i} className="flex items-center flex-1">
              <motion.div
                className="flex-1 h-px bg-white/10"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: "easeOut" as any, delay: i * 0.2 + 0.3 }}
                style={{ originX: 0 }}
              />
              {i < STEPS.length - 1 && (
                <motion.div
                  className="size-1 bg-white/20 mx-1 shrink-0"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.2 + 0.7 }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
