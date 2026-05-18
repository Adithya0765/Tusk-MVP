'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Download, FileText, Share2, CheckCircle2, AlertTriangle } from 'lucide-react'
import { motion } from 'motion/react'
import type { ConclusionData, DbConclusion, DbTurn } from '@/types'

interface ConclusionPanelProps {
  conclusion: DbConclusion; turns: DbTurn[]; topic: string; shareSlug: string; hideActions?: boolean
}

const CONF: Record<string, { color: string; bg: string; border: string }> = {
  Low:    { color: 'rgba(248,113,113,0.8)', bg: 'rgba(239,68,68,0.06)',  border: 'rgba(239,68,68,0.18)'  },
  Medium: { color: 'rgba(251,191,36,0.8)',  bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.18)' },
  High:   { color: 'rgba(74,222,128,0.8)',  bg: 'rgba(34,197,94,0.06)',  border: 'rgba(34,197,94,0.18)'  },
}

function buildMarkdown(topic: string, turns: DbTurn[], data: ConclusionData): string {
  const L: string[] = []
  L.push(`# TUSK Debate: ${topic}`, '', '## Transcript', '')
  for (const t of turns) L.push(`### Round ${t.round_num} — ${t.agent === 'A' ? 'FOR' : 'AGAINST'}`, '', t.content, '')
  L.push('---', '', '## Conclusion', '', '### Executive Summary', '', data.executiveSummary, '')
  L.push('### Key Points FOR', ''); for (const p of data.keyPointsFor) L.push(`- ${p}`)
  L.push('', '### Key Points AGAINST', ''); for (const p of data.keyPointsAgainst) L.push(`- ${p}`)
  L.push('', '### Unresolved Tensions', ''); for (const p of data.unresolvedTensions) L.push(`- ${p}`)
  L.push('', '### Final Verdict', '', data.finalVerdict, '', `### Confidence: ${data.confidenceLevel}`)
  return L.join('\n')
}

function ActionBtn({ onClick, disabled, icon: Icon, label }: {
  onClick: () => void; disabled?: boolean; icon: typeof FileText; label: string
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: 'rgba(255,255,255,0.5)',
      }}
    >
      <Icon className="size-3.5" />{label}
    </motion.button>
  )
}

export function ConclusionPanel({ conclusion, turns, topic, shareSlug, hideActions = false }: ConclusionPanelProps) {
  const [copying, setCopying] = useState(false)

  let data: ConclusionData
  try { data = JSON.parse(conclusion.content) as ConclusionData }
  catch {
    return (
      <div className="p-4 text-xs font-mono text-red-400/70" style={{
        background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)',
      }}>
        <AlertTriangle className="size-4 inline mr-2" />
        Failed to parse conclusion data.
      </div>
    )
  }

  function handleDownloadMarkdown() {
    const blob = new Blob([buildMarkdown(topic, turns, data)], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `tusk-debate-${shareSlug}.md`; a.click()
    URL.revokeObjectURL(url)
  }

  async function handleDownloadPDF() {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const W = doc.internal.pageSize.getWidth(), margin = 48, maxW = W - margin * 2; let y = margin
    function add(text: string, size: number, bold = false, color: [number,number,number] = [200,200,200]) {
      doc.setFontSize(size); doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setTextColor(...color)
      for (const line of doc.splitTextToSize(text, maxW) as string[]) {
        if (y > doc.internal.pageSize.getHeight() - margin) { doc.addPage(); y = margin }
        doc.text(line, margin, y); y += size * 1.4
      }; y += 4
    }
    add(`TUSK Debate: ${topic}`, 18, true, [240,240,240]); y += 8
    add('Transcript', 13, true, [180,180,180])
    for (const t of turns) {
      add(`Round ${t.round_num} — ${t.agent === 'A' ? 'FOR' : 'AGAINST'}`, 10, true, [160,160,160])
      add(t.content, 10, false, [200,200,200]); y += 4
    }
    y += 8; add('Conclusion', 13, true, [180,180,180])
    add('Executive Summary', 11, true, [160,160,160]); add(data.executiveSummary, 10)
    add('Key Points FOR', 11, true, [160,160,160]); for (const p of data.keyPointsFor) add(`• ${p}`, 10)
    add('Key Points AGAINST', 11, true, [160,160,160]); for (const p of data.keyPointsAgainst) add(`• ${p}`, 10)
    add('Unresolved Tensions', 11, true, [160,160,160]); for (const p of data.unresolvedTensions) add(`• ${p}`, 10)
    add('Final Verdict', 11, true, [160,160,160]); add(data.finalVerdict, 10)
    add(`Confidence: ${data.confidenceLevel}`, 10, true, [140,140,140])
    doc.save(`tusk-debate-${shareSlug}.pdf`)
  }

  async function handleShare() {
    setCopying(true)
    try { await navigator.clipboard.writeText(`${window.location.origin}/share/${shareSlug}`); toast.success('Link copied!') }
    catch { toast.error('Failed to copy link.') }
    finally { setCopying(false) }
  }

  const conf = CONF[data.confidenceLevel] ?? CONF.Medium

  const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07 } },
  }
  const item = {
    hidden:  { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Action buttons */}
      {!hideActions && (
        <motion.div variants={item} className="flex flex-wrap gap-2 justify-end pb-1">
          <ActionBtn onClick={handleDownloadMarkdown} icon={FileText} label="Markdown" />
          <ActionBtn onClick={handleDownloadPDF} icon={Download} label="PDF" />
          <ActionBtn onClick={handleShare} disabled={copying} icon={Share2} label={copying ? 'Copying…' : 'Share'} />
        </motion.div>
      )}

      {/* Summary */}
      <motion.div variants={item} className="relative p-5 overflow-hidden" style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{
          background: 'linear-gradient(90deg, rgba(255,255,255,0.15) 0%, transparent 60%)',
        }} />
        <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/25 mb-3">Executive Summary</p>
        <p className="text-sm leading-relaxed text-white/65">{data.executiveSummary}</p>
      </motion.div>

      {/* For / Against */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/[0.06]">
        {[
          { title: 'Key Points FOR',     pts: data.keyPointsFor     },
          { title: 'Key Points AGAINST', pts: data.keyPointsAgainst },
        ].map(({ title, pts }) => (
          <div key={title} className="p-5 bg-background" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/25 mb-4">{title}</p>
            <ul className="space-y-2.5">
              {pts.map((pt, i) => (
                <li key={i} className="flex gap-2.5 text-xs text-white/55 font-mono">
                  <CheckCircle2 className="size-3.5 shrink-0 mt-0.5 text-white/20" />
                  {pt}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </motion.div>

      {/* Tensions */}
      <motion.div variants={item} className="p-5" style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/25 mb-4">Unresolved Tensions</p>
        <ul className="space-y-2.5">
          {data.unresolvedTensions.map((pt, i) => (
            <li key={i} className="flex gap-2.5 text-xs text-white/50 font-mono">
              <span className="text-white/20 shrink-0">—</span>
              {pt}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Final verdict */}
      <motion.div variants={item} className="relative p-5 overflow-hidden" style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.09)',
      }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        }} />
        <div className="flex items-center justify-between mb-4">
          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/25">Final Verdict</p>
          <span
            className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5"
            style={{ background: conf.bg, border: `1px solid ${conf.border}`, color: conf.color }}
          >
            {data.confidenceLevel} confidence
          </span>
        </div>
        <p className="text-sm leading-relaxed text-white/75 font-medium">{data.finalVerdict}</p>
      </motion.div>
    </motion.div>
  )
}
