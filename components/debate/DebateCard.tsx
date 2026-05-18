'use client'

import Link from 'next/link'
import { DbSession, SessionStatus } from '@/types/index'
import { ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'

interface DebateCardProps { session: DbSession }

const STATUS: Record<SessionStatus, { label: string; color: string; bg: string; border: string }> = {
  processing: { label: 'Processing', color: 'rgba(251,191,36,0.8)',  bg: 'rgba(245,158,11,0.06)',  border: 'rgba(245,158,11,0.18)' },
  complete:   { label: 'Complete',   color: 'rgba(74,222,128,0.8)',  bg: 'rgba(34,197,94,0.06)',   border: 'rgba(34,197,94,0.18)'  },
  failed:     { label: 'Failed',     color: 'rgba(248,113,113,0.8)', bg: 'rgba(239,68,68,0.06)',   border: 'rgba(239,68,68,0.18)'  },
}

function truncate(t: string, n: number) { return t.length > n ? t.slice(0, n) + '…' : t }

export function DebateCard({ session }: DebateCardProps) {
  const s = STATUS[session.status]
  const date = new Date(session.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })

  return (
    <Link href={`/debate/${session.id}`} className="block group">
      <motion.div
        whileHover={{ x: 3 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="relative p-4 overflow-hidden transition-colors duration-200"
        style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Left accent bar — slides in on hover */}
        <div
          className="absolute left-0 top-0 bottom-0 w-px transition-all duration-200 group-hover:opacity-100 opacity-0"
          style={{ background: 'rgba(255,255,255,0.25)' }}
        />

        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-mono text-white/75 leading-snug mb-1 group-hover:text-white/95 transition-colors duration-200">
              {truncate(session.topic, 90)}
            </p>
            <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest">{date}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span
              className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest px-2 py-0.5"
              style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}
            >
              <span
                className="size-1 rounded-full"
                style={{
                  background: s.color,
                  animation: session.status === 'processing' ? 'ping-slow 2s cubic-bezier(0,0,0.2,1) infinite' : 'none',
                }}
              />
              {s.label}
            </span>
            <ChevronRight
              className="size-3.5 text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all duration-200"
            />
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
