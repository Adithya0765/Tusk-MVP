'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'

export function CtaSection() {
  return (
    <section className="py-20 px-4 mb-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px" style={{
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" as any }}
        className="mx-auto max-w-4xl relative rounded-2xl overflow-hidden bg-white/[0.015] border border-white/[0.04] shadow-sm"
      >
        {/* Top accent line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="relative z-10 text-center px-8 py-20 md:py-28">
          <motion.p 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xs font-mono uppercase tracking-widest text-white/30 mb-6"
          >
            Get started
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white/90 mb-5 tracking-tight"
            style={{ letterSpacing: '-0.04em' }}
          >
            Ready to settle<br />the debate?
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base text-white/40 max-w-md mx-auto mb-10 leading-relaxed"
          >
            Experience the future of AI debates. Open, unrestricted, and built for performance.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link
              href="/debate/new"
              className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg text-sm font-medium transition-transform hover:scale-105 active:scale-95"
            >
              Start Debate
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/#how-it-works"
              className="btn-ghost inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg text-sm font-medium transition-transform hover:scale-105 active:scale-95"
            >
              Learn more
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
