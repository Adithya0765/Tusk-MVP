'use client'

import Link from 'next/link'
import { Home } from 'lucide-react'
import { motion } from 'motion/react'

export default function NotFound() {
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
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="text-center space-y-8 relative z-10 max-w-md"
      >
        {/* Giant 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
          className="font-mono font-black leading-none tracking-tighter select-none"
          style={{
            fontSize: 'clamp(8rem,20vw,14rem)',
            color: 'rgba(255,255,255,0.06)',
          }}
        >
          404
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="-mt-4"
        >
          <h1 className="text-xl font-bold text-white/80 mb-3 font-mono uppercase tracking-wider">
            Page not found
          </h1>
          <p className="text-sm font-mono text-white/30 leading-relaxed max-w-xs mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Link
            href="/"
            className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-xs"
          >
            <Home className="size-3.5" />
            Back to home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
