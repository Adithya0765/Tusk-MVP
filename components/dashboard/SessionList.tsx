'use client'

import Link from 'next/link'
import { DbSession } from '@/types/index'
import { DebateCard } from '@/components/debate/DebateCard'
import { Plus } from 'lucide-react'
import { motion } from 'motion/react'

interface SessionListProps { sessions: DbSession[] }

export function SessionList({ sessions }: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center px-6 py-16 text-center"
        style={{ border: '1px dashed rgba(255,255,255,0.08)' }}
      >
        <div
          className="flex items-center justify-center size-12 mb-5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" fill="none"/>
            <path d="M7 4L10 5.5V8.5L7 10L4 8.5V5.5L7 4Z" fill="rgba(255,255,255,0.25)"/>
          </svg>
        </div>
        <p className="text-xs font-mono text-white/30 uppercase tracking-widest mb-5">
          No debates yet
        </p>
        <Link
          href="/debate/new"
          className="btn-primary inline-flex items-center gap-2 px-5 py-2 text-xs"
        >
          <Plus className="size-3.5" />
          Start your first debate
        </Link>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col gap-px bg-white/[0.04]">
      {sessions.map((s, i) => (
        <motion.div
          key={s.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: i * 0.06, ease: [0.23, 1, 0.32, 1] }}
          className="bg-background"
        >
          <DebateCard session={s} />
        </motion.div>
      ))}
    </div>
  )
}
