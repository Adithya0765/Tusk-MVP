'use client'

import { motion } from 'motion/react'
import type { Agent, DbTurn } from '@/types'

interface TurnBubbleProps {
  turn: DbTurn
  agentNames: { agentA: string; agentB: string }
}

const CONFIG: Record<Agent, { label: string; align: string }> = {
  A: { label: 'FOR',     align: 'items-start' },
  B: { label: 'AGAINST', align: 'items-end'   },
}

export function TurnBubble({ turn, agentNames }: TurnBubbleProps) {
  const cfg = CONFIG[turn.agent]
  const agentName = turn.agent === 'A' ? agentNames.agentA : agentNames.agentB
  const isFor = turn.agent === 'A'

  return (
    <div className={`flex flex-col ${cfg.align}`}>
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="relative max-w-[90%] p-5 overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Directional top accent */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{
          background: isFor
            ? 'linear-gradient(90deg, rgba(255,255,255,0.2) 0%, transparent 60%)'
            : 'linear-gradient(270deg, rgba(255,255,255,0.2) 0%, transparent 60%)',
        }} />

        <div className="flex items-center gap-3 mb-3">
          <span
            className="text-[9px] font-mono uppercase tracking-[0.15em] px-2 py-0.5 text-white/60"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {cfg.label}
          </span>
          <span className="text-xs font-mono text-white/40">{agentName}</span>
          <span className="text-[10px] font-mono ml-auto text-white/20">Round {turn.round_num}</span>
        </div>

        <p className="text-sm leading-relaxed whitespace-pre-wrap text-white/70">
          {turn.content}
        </p>

        {turn.token_count != null && (
          <p className="text-[10px] mt-3 font-mono text-white/20">
            {turn.token_count} tokens
          </p>
        )}
      </motion.div>
    </div>
  )
}
