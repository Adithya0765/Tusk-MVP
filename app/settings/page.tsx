'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { DbUser } from '@/types/index'
import { Save, CheckCircle2, Bell, User } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{
        background: 'linear-gradient(90deg, rgba(255,255,255,0.12) 0%, transparent 60%)',
      }} />
      {children}
    </div>
  )
}

function Bone({ className }: { className: string }) {
  return (
    <div className={`animate-pulse ${className}`} style={{ background: 'rgba(255,255,255,0.06)' }} />
  )
}

export default function SettingsPage() {
  const [user, setUser] = useState<DbUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [nameFocused, setNameFocused] = useState(false)

  useEffect(() => {
    fetch('/api/user/me')
      .then(r => r.json())
      .then((data: DbUser) => { setUser(data); setDisplayName(data.display_name ?? '') })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  async function saveDisplayName() {
    setSaving(true)
    try {
      await fetch('/api/user/me', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: displayName }),
      })
      setSaved(true); toast.success('Saved')
      setTimeout(() => setSaved(false), 2000)
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  async function toggleNotifyEmail(value: boolean) {
    setUser(prev => prev ? { ...prev, notify_email: value } : prev)
    try {
      await fetch('/api/user/me', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notify_email: value }),
      })
      toast.success('Updated')
    } catch {
      setUser(prev => prev ? { ...prev, notify_email: !value } : prev)
      toast.error('Failed')
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen px-4 py-28 bg-background">
        <div className="mx-auto max-w-lg space-y-4">
          <Bone className="h-8 w-32 mb-8" />
          <Section className="p-6 space-y-4">
            <Bone className="h-3 w-20" /><Bone className="h-10 w-full" /><Bone className="h-8 w-20" />
          </Section>
          <Section className="p-6"><Bone className="h-10 w-full" /></Section>
        </div>
      </main>
    )
  }

  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
  const item = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45 } } }

  return (
    <main className="min-h-screen relative px-4 py-28 overflow-hidden bg-background">
      {/* Fine grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '24px 24px',
        maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 80%)',
      }} />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-lg space-y-5 relative z-10"
      >
        {/* Header */}
        <motion.div variants={item} className="pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/25 mb-1">// SETTINGS</p>
          <h1 className="text-2xl font-bold text-white/90 font-mono uppercase tracking-tight">Account</h1>
        </motion.div>

        {/* Display Name */}
        <motion.div variants={item}>
          <Section className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <User className="size-3.5 text-white/30" />
              <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/25">Display Name</p>
            </div>
            <motion.input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              placeholder="Enter your display name"
              className="w-full px-4 py-3 text-sm font-mono text-white/80 placeholder-white/20 focus:outline-none transition-colors duration-200"
              animate={{
                borderColor: nameFocused ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
              }}
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
            <motion.button
              onClick={saveDisplayName}
              disabled={saving}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: saved ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${saved ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.1)'}`,
                color: saved ? 'rgba(74,222,128,0.8)' : 'rgba(255,255,255,0.5)',
              }}
            >
              <AnimatePresence mode="wait">
                {saved
                  ? <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2"><CheckCircle2 className="size-3.5" />Saved</motion.span>
                  : <motion.span key="save"  initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2"><Save className="size-3.5" />{saving ? 'Saving…' : 'Save'}</motion.span>
                }
              </AnimatePresence>
            </motion.button>
          </Section>
        </motion.div>

        {/* Notifications */}
        <motion.div variants={item}>
          <Section className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <Bell className="size-3.5 text-white/30 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-mono text-white/70 mb-0.5">Email Notifications</p>
                  <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest">
                    Get notified when debates complete
                  </p>
                </div>
              </div>
              <motion.button
                role="switch"
                aria-checked={user?.notify_email ?? false}
                onClick={() => toggleNotifyEmail(!(user?.notify_email ?? false))}
                whileTap={{ scale: 0.95 }}
                className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer transition-colors duration-200 focus:outline-none"
                style={{
                  background: user?.notify_email ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                <motion.span
                  animate={{ x: user?.notify_email ? 16 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="inline-block h-3 w-3 bg-white shadow-sm mt-0.5"
                />
              </motion.button>
            </div>
          </Section>
        </motion.div>

        {/* Account info */}
        {user && (
          <motion.div variants={item}>
            <Section className="p-5">
              <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/25 mb-4">Account Info</p>
              <div className="space-y-3">
                {[
                  { label: 'Email', value: user.email },
                  { label: 'Plan',  value: user.tier.charAt(0).toUpperCase() + user.tier.slice(1) },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between py-2" style={{
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/25">{row.label}</span>
                    <span className="text-xs font-mono text-white/55">{row.value}</span>
                  </div>
                ))}
              </div>
            </Section>
          </motion.div>
        )}
      </motion.div>
    </main>
  )
}
