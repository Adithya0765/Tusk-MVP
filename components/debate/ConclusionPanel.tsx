'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Download, FileText, Share2, CheckCircle2, AlertTriangle, BookOpen, Target, BarChart2, XCircle, Zap } from 'lucide-react'
import { motion } from 'motion/react'
import type { ConclusionData, DbConclusion, DbTurn } from '@/types'

interface ConclusionPanelProps {
  conclusion: DbConclusion; turns: DbTurn[]; topic: string; shareSlug: string; hideActions?: boolean; mode?: 'debate' | 'analysis'
}

const CONF: Record<string, { color: string; bg: string; border: string }> = {
  Low:    { color: 'rgba(248,113,113,0.8)', bg: 'rgba(239,68,68,0.06)',  border: 'rgba(239,68,68,0.18)'  },
  Medium: { color: 'rgba(251,191,36,0.8)',  bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.18)' },
  High:   { color: 'rgba(74,222,128,0.8)',  bg: 'rgba(34,197,94,0.06)',  border: 'rgba(34,197,94,0.18)'  },
}

function buildMarkdown(topic: string, turns: DbTurn[], data: ConclusionData, mode: string): string {
  const L: string[] = []
  L.push(`# TUSK Session: ${topic}`, '', '## Transcript', '')
  for (const t of turns) {
    const label = t.agent === 'A'
      ? (mode === 'analysis' ? 'Builder' : 'FOR')
      : (mode === 'analysis' ? 'Stress Tester' : 'AGAINST')
    L.push(`### Round ${t.round_num} — ${label}`, '', t.content, '')
  }
  L.push('---', '', '## Assessment', '', '### Executive Summary', '', data.executiveSummary, '')
  const forLabel = mode === 'analysis' ? 'What Works Well' : 'Key Points For'
  const againstLabel = mode === 'analysis' ? 'Remaining Risks' : 'Key Points Against'
  L.push(`### ${forLabel}`, ''); for (const p of data.keyPointsFor) L.push(`- ${p}`)
  L.push('', `### ${againstLabel}`, ''); for (const p of data.keyPointsAgainst) L.push(`- ${p}`)
  L.push('', '### Unresolved Tensions', ''); for (const p of data.unresolvedTensions) L.push(`- ${p}`)
  L.push('', '### Final Verdict', '', data.finalVerdict, '', `### Confidence: ${data.confidenceLevel}`)
  if (mode === 'analysis' && data.recommendedActions?.length) {
    L.push('', '### Recommended Next Steps', ''); for (const a of data.recommendedActions) L.push(`- ${a}`)
  }
  if (mode === 'analysis' && data.improvementSuggestions?.length) {
    L.push('', '### How to Improve Further', ''); for (const s of data.improvementSuggestions) L.push(`- ${s}`)
  }
  return L.join('\n')
}

function buildPRDMarkdown(topic: string, data: ConclusionData): string {
  const prd = data.prd
  if (!prd) return `# PRD: ${topic}\n\nPRD data not available.`
  const L: string[] = []
  L.push(`# Product Requirements Document`, '', `## ${topic}`, '', '---', '')
  L.push('## Problem Statement', '', prd.problemStatement, '')
  L.push('## Target Users', '', prd.targetUsers, '')
  L.push('## Core Features', '')
  prd.coreFeatures.forEach((f, i) => L.push(`### ${i + 1}. ${f}`, ''))
  L.push('## Success Metrics', '')
  for (const m of prd.successMetrics) L.push(`- ${m}`)
  L.push('', '## Out of Scope (v1)', '')
  for (const o of prd.outOfScope) L.push(`- ${o}`)
  L.push('', '## MVP Scope', '', prd.mvpScope)
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

export function ConclusionPanel({ conclusion, turns, topic, shareSlug, hideActions = false, mode = 'debate' }: ConclusionPanelProps) {
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
    const blob = new Blob([buildMarkdown(topic, turns, data, mode)], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `tusk-session-${shareSlug}.md`; a.click()
    URL.revokeObjectURL(url)
  }

  function handleDownloadPRDMarkdown() {
    const blob = new Blob([buildPRDMarkdown(topic, data)], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `tusk-prd-${shareSlug}.md`; a.click()
    URL.revokeObjectURL(url)
  }

  async function handleDownloadPRDPDF() {
    if (!data.prd) return
    const prd = data.prd
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const W = doc.internal.pageSize.getWidth()
    const H = doc.internal.pageSize.getHeight()
    const margin = 50
    const maxW = W - margin * 2
    let y = margin

    function addPageIfNeeded(spaceNeeded: number) {
      if (y + spaceNeeded > H - margin) { doc.addPage(); y = margin }
    }
    function add(text: string, size: number, bold: boolean, color: [number, number, number], spacing?: number) {
      addPageIfNeeded(size * 2)
      doc.setFontSize(size); doc.setFont('helvetica', bold ? 'bold' : 'normal')
      doc.setTextColor(color[0], color[1], color[2])
      const lines = doc.splitTextToSize(text, maxW) as string[]
      for (const line of lines) { addPageIfNeeded(size * 1.5); doc.text(line, margin, y); y += size * 1.5 }
      if (spacing) y += spacing
    }
    function addBullet(text: string, size: number, color: [number, number, number]) {
      addPageIfNeeded(size * 1.5)
      doc.setFontSize(size); doc.setFont('helvetica', 'normal'); doc.setTextColor(color[0], color[1], color[2])
      const lines = doc.splitTextToSize('\u2022  ' + text, maxW - 16) as string[]
      for (const line of lines) { addPageIfNeeded(size * 1.5); doc.text(line, margin + 8, y); y += size * 1.5 }
    }

    // Header
    add('Product Requirements Document', 20, true, [30, 30, 30], 6)
    add(topic, 13, false, [80, 80, 80], 12)
    doc.setDrawColor(200, 200, 200); doc.setLineWidth(0.5); doc.line(margin, y, W - margin, y); y += 20

    add('Problem Statement', 13, true, [50, 50, 50], 4)
    add(prd.problemStatement, 10, false, [60, 60, 60], 14)

    add('Target Users', 13, true, [50, 50, 50], 4)
    add(prd.targetUsers, 10, false, [60, 60, 60], 14)

    add('Core Features', 13, true, [50, 50, 50], 4)
    prd.coreFeatures.forEach((f, i) => { add(`${i + 1}.  ${f}`, 10, false, [60, 60, 60], 4) })
    y += 8

    add('Success Metrics', 13, true, [50, 50, 50], 4)
    for (const m of prd.successMetrics) addBullet(m, 10, [60, 60, 60])
    y += 8

    add('Out of Scope (v1)', 13, true, [50, 50, 50], 4)
    for (const o of prd.outOfScope) addBullet(o, 10, [60, 60, 60])
    y += 8

    // MVP scope box
    addPageIfNeeded(70)
    doc.setFillColor(240, 248, 244)
    doc.roundedRect(margin, y, maxW, 54, 3, 3, 'F')
    doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(34, 130, 94)
    doc.text('MVP Scope', margin + 8, y + 14)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(60, 60, 60)
    const mvpLines = doc.splitTextToSize(prd.mvpScope, maxW - 16) as string[]
    let my = y + 26
    for (const line of mvpLines) { doc.text(line, margin + 8, my); my += 12 }

    doc.save(`tusk-prd-${shareSlug}.pdf`)
  }

  async function handleDownloadPDF() {
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const W = doc.internal.pageSize.getWidth()
    const H = doc.internal.pageSize.getHeight()
    const margin = 50
    const maxW = W - margin * 2
    let y = margin

    function addPageIfNeeded(spaceNeeded: number) {
      if (y + spaceNeeded > H - margin) {
        doc.addPage()
        y = margin
      }
    }

    function add(text: string, size: number, bold: boolean, color: [number, number, number], spacing?: number) {
      addPageIfNeeded(size * 2)
      doc.setFontSize(size)
      doc.setFont('helvetica', bold ? 'bold' : 'normal')
      doc.setTextColor(color[0], color[1], color[2])
      const lines = doc.splitTextToSize(text, maxW) as string[]
      for (const line of lines) {
        addPageIfNeeded(size * 1.5)
        doc.text(line, margin, y)
        y += size * 1.5
      }
      if (spacing) y += spacing
    }

    function addBullet(text: string, size: number, color: [number, number, number]) {
      addPageIfNeeded(size * 1.5)
      doc.setFontSize(size)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(color[0], color[1], color[2])
      doc.text('\u2022  ' + text, margin + 8, y)
      y += size * 1.6
    }

    // Title
    add(`TUSK: ${topic}`, 20, true, [30, 30, 30], 12)

    // Separator line
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.5)
    doc.line(margin, y, W - margin, y)
    y += 16

    // Transcript section
    add('Transcript', 14, true, [50, 50, 50], 8)

    for (const t of turns) {
      const label = t.agent === 'A'
        ? (mode === 'analysis' ? 'Builder' : 'FOR')
        : (mode === 'analysis' ? 'Stress Tester' : 'AGAINST')
      add(`Round ${t.round_num} — ${label}`, 11, true, [80, 80, 80], 4)
      add(t.content, 10, false, [60, 60, 60], 12)
    }

    // Separator
    addPageIfNeeded(40)
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.5)
    doc.line(margin, y, W - margin, y)
    y += 16

    // Assessment section
    add(mode === 'analysis' ? 'Assessment' : 'Conclusion', 14, true, [50, 50, 50], 8)

    add('Executive Summary', 12, true, [70, 70, 70], 4)
    add(data.executiveSummary, 10, false, [60, 60, 60], 12)

    const forLabel = mode === 'analysis' ? 'What Works Well' : 'Key Points FOR'
    add(forLabel, 12, true, [70, 70, 70], 4)
    for (const p of data.keyPointsFor) addBullet(p, 10, [60, 60, 60])
    y += 4

    const againstLabel = mode === 'analysis' ? 'Remaining Risks / Gaps' : 'Key Points AGAINST'
    add(againstLabel, 12, true, [70, 70, 70], 4)
    for (const p of data.keyPointsAgainst) addBullet(p, 10, [60, 60, 60])
    y += 4

    add('Unresolved Tensions', 12, true, [70, 70, 70], 4)
    for (const p of data.unresolvedTensions) addBullet(p, 10, [60, 60, 60])
    y += 8

    // Final verdict box
    addPageIfNeeded(80)
    doc.setFillColor(245, 245, 245)
    doc.roundedRect(margin, y, maxW, 60, 3, 3, 'F')
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(80, 80, 80)
    doc.text('Final Verdict', margin + 6, y + 12)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    const verdictLines = doc.splitTextToSize(data.finalVerdict, maxW - 12) as string[]
    let vy = y + 22
    for (const line of verdictLines) {
      doc.text(line, margin + 6, vy)
      vy += 12
    }
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(120, 120, 120)
    doc.text(`Confidence: ${data.confidenceLevel}`, margin + 6, vy + 6)
    y = vy + 24

    if (mode === 'analysis' && data.recommendedActions?.length) {
      addPageIfNeeded(40)
      doc.setDrawColor(200, 200, 200); doc.setLineWidth(0.5); doc.line(margin, y, W - margin, y); y += 16
      add('Recommended Next Steps', 14, true, [34, 130, 94], 8)
      for (let i = 0; i < data.recommendedActions.length; i++) {
        add(`${i + 1}. ${data.recommendedActions[i]}`, 10, false, [60, 60, 60], 4)
      }
    }

    if (mode === 'analysis' && data.improvementSuggestions?.length) {
      addPageIfNeeded(40)
      add('How to Improve Further', 14, true, [59, 130, 246], 8)
      for (let i = 0; i < data.improvementSuggestions.length; i++) {
        add(`${i + 1}. ${data.improvementSuggestions[i]}`, 10, false, [60, 60, 60], 4)
      }
    }

    doc.save(`tusk-session-${shareSlug}.pdf`)
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
      {!hideActions && (
        <motion.div variants={item} className="flex flex-wrap gap-2 justify-end pb-1">
          <ActionBtn onClick={handleDownloadMarkdown} icon={FileText} label="Transcript" />
          <ActionBtn onClick={handleDownloadPDF} icon={Download} label="PDF" />
          {mode === 'analysis' && data.prd && (
            <>
              <ActionBtn onClick={handleDownloadPRDMarkdown} icon={BookOpen} label="PRD .md" />
              <ActionBtn onClick={handleDownloadPRDPDF} icon={Download} label="PRD PDF" />
            </>
          )}
          <ActionBtn onClick={handleShare} disabled={copying} icon={Share2} label={copying ? 'Copying…' : 'Share'} />
        </motion.div>
      )}

      {/* Final Verdict - shown FIRST so no scrolling needed */}
      <motion.div variants={item} className="relative p-5 overflow-hidden" style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.12)',
      }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
        }} />
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 font-semibold">Final Verdict</p>
          <span
            className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5"
            style={{ background: conf.bg, border: `1px solid ${conf.border}`, color: conf.color }}
          >
            {data.confidenceLevel} confidence
          </span>
        </div>
        <p className="text-sm leading-relaxed text-white/80 font-medium">{data.finalVerdict}</p>
      </motion.div>

      {/* Executive Summary */}
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

      {/* Strengths / Risks */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/[0.06]">
        {[
          { title: mode === 'analysis' ? 'What Works Well' : 'Key Points FOR / PROS',     pts: data.keyPointsFor     },
          { title: mode === 'analysis' ? 'Remaining Risks / Gaps' : 'Key Points AGAINST / CONS', pts: data.keyPointsAgainst },
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

      {/* Recommended Actions - analysis mode only */}
      {mode === 'analysis' && data.recommendedActions && data.recommendedActions.length > 0 && (
        <motion.div variants={item} className="relative p-5 overflow-hidden" style={{
          background: 'rgba(34,197,94,0.04)',
          border: '1px solid rgba(34,197,94,0.12)',
        }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{
            background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.2), transparent)',
          }} />
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 font-semibold mb-4">Recommended Next Steps</p>
          <ul className="space-y-3">
            {data.recommendedActions.map((action, i) => (
              <li key={i} className="flex gap-3 text-xs text-white/70 font-mono leading-relaxed">
                <span className="shrink-0 flex items-center justify-center size-5 rounded-full text-[10px] font-bold" style={{
                  background: 'rgba(34,197,94,0.12)',
                  color: 'rgba(34,197,94,0.7)',
                  border: '1px solid rgba(34,197,94,0.2)',
                }}>{i + 1}</span>
                {action}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Improvement Suggestions - analysis mode only */}
      {mode === 'analysis' && data.improvementSuggestions && data.improvementSuggestions.length > 0 && (
        <motion.div variants={item} className="relative p-5 overflow-hidden" style={{
          background: 'rgba(59,130,246,0.04)',
          border: '1px solid rgba(59,130,246,0.12)',
        }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{
            background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.2), transparent)',
          }} />
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 font-semibold mb-4">How to Improve Further</p>
          <ul className="space-y-3">
            {data.improvementSuggestions.map((suggestion, i) => (
              <li key={i} className="flex gap-3 text-xs text-white/70 font-mono leading-relaxed">
                <span className="shrink-0 flex items-center justify-center size-5 rounded-full text-[10px] font-bold" style={{
                  background: 'rgba(59,130,246,0.12)',
                  color: 'rgba(59,130,246,0.7)',
                  border: '1px solid rgba(59,130,246,0.2)',
                }}>{i + 1}</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* PRD - analysis mode only */}
      {mode === 'analysis' && data.prd && (
        <motion.div variants={item} className="space-y-px overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
          {/* PRD Header */}
          <div className="relative px-5 py-4 overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            }} />
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-white/50" />
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-white/70 font-bold">Product Requirements Document</p>
            </div>
          </div>

          {/* Problem Statement */}
          <div className="px-5 py-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Target className="size-3.5 text-white/30" />
              <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/30">Problem Statement</p>
            </div>
            <p className="text-sm text-white/75 leading-relaxed font-mono">{data.prd.problemStatement}</p>
          </div>

          {/* Target Users */}
          <div className="px-5 py-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Target className="size-3.5 text-white/30" />
              <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/30">Target Users</p>
            </div>
            <p className="text-sm text-white/75 leading-relaxed font-mono">{data.prd.targetUsers}</p>
          </div>

          {/* Core Features */}
          <div className="px-5 py-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="size-3.5 text-white/30" />
              <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/30">Core Features</p>
            </div>
            <ul className="space-y-2.5">
              {data.prd.coreFeatures.map((f, i) => (
                <li key={i} className="flex gap-2.5 text-xs text-white/65 font-mono leading-relaxed">
                  <span className="shrink-0 flex items-center justify-center size-4 rounded text-[9px] font-bold mt-0.5" style={{
                    background: 'rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.5)',
                  }}>{i + 1}</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Success Metrics + Out of Scope side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/[0.06]">
            <div className="px-5 py-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center gap-2 mb-3">
                <BarChart2 className="size-3.5 text-white/30" />
                <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/30">Success Metrics</p>
              </div>
              <ul className="space-y-2">
                {data.prd.successMetrics.map((m, i) => (
                  <li key={i} className="flex gap-2 text-xs text-white/60 font-mono leading-relaxed">
                    <CheckCircle2 className="size-3.5 shrink-0 mt-0.5 text-white/20" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
            <div className="px-5 py-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="size-3.5 text-white/30" />
                <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/30">Out of Scope (v1)</p>
              </div>
              <ul className="space-y-2">
                {data.prd.outOfScope.map((o, i) => (
                  <li key={i} className="flex gap-2 text-xs text-white/60 font-mono leading-relaxed">
                    <span className="text-white/20 shrink-0">—</span>
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* MVP Scope */}
          <div className="relative px-5 py-4 overflow-hidden" style={{ background: 'rgba(34,197,94,0.04)' }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{
              background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.25), transparent)',
            }} />
            <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/30 mb-2">MVP Scope</p>
            <p className="text-sm text-white/75 leading-relaxed font-mono">{data.prd.mvpScope}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
