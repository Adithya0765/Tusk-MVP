'use client'

import { AlertTriangle, RotateCcw } from 'lucide-react'
import { motion } from 'motion/react'

interface ErrorPageProps {
  error: Error
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden bg-background">
      {/* Fine grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '24px 24px',
        maskImage: 'radial-gradient(ellipse 80% 70% at center, black 0%, transparent 80%)',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="text-center space-y-7 max-w-sm relative z-10"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center size-16 mx-auto"
          style={{
            background: 'rgba(239,68,68,0.07)',
            border: '1px solid rgba(239,68,68,0.18)',
          }}
        >
          <AlertTriangle className="size-8 text-red-400/70" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h2 className="text-lg font-bold text-white/80 mb-2 font-mono uppercase tracking-wider">
            Something went wrong
          </h2>
          <p className="text-xs font-mono text-white/30 leading-relaxed">
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <button
            onClick={reset}
            className="btn-ghost inline-flex items-center gap-2 px-6 py-2.5 text-xs"
          >
            <RotateCcw className="size-3.5" />
            Try again
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}
