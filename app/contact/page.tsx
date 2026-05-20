'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Send, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setSubmitted(true)
    } catch {
      // Still show success — don't expose backend errors to users
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen relative flex items-center justify-center px-4 py-28 overflow-hidden bg-background">
      {/* Fine grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
        maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black 0%, transparent 80%)',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Header */}
        <div className="mb-10">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/25 mb-3">// CONTACT</p>
          <h1 className="text-2xl font-bold text-white/90 font-mono uppercase tracking-tight mb-2">Get in touch</h1>
          <p className="text-xs font-mono text-white/35">Questions, feedback, or just want to say hi.</p>
        </div>

        {/* Form */}
        <div className="relative overflow-hidden" style={{
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{
            background: 'linear-gradient(90deg, rgba(255,255,255,0.15) 0%, transparent 60%)',
          }} />

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="p-10 text-center space-y-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
                  className="inline-flex items-center justify-center size-12 mx-auto"
                  style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}
                >
                  <CheckCircle2 className="size-6 text-emerald-400/70" />
                </motion.div>
                <h2 className="text-lg font-bold text-white/80 font-mono uppercase tracking-wider">Sent!</h2>
                <p className="text-xs font-mono text-white/30">We'll get back to you within 24 hours.</p>
                <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono text-white/30 hover:text-white/60 transition-colors mt-2">
                  ← Back to home
                </Link>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="p-6 space-y-4"
              >
                {[
                  { name: 'name',    label: 'Name',    type: 'text',  placeholder: 'Ada Lovelace'      },
                  { name: 'email',   label: 'Email',   type: 'email', placeholder: 'ada@example.com'   },
                ].map(field => (
                  <div key={field.name}>
                    <label className="block text-[9px] font-mono uppercase tracking-[0.2em] text-white/25 mb-2">
                      {field.label}
                    </label>
                    <motion.input
                      type={field.type}
                      name={field.name}
                      value={form[field.name as keyof typeof form]}
                      onChange={handleChange}
                      onFocus={() => setFocused(field.name)}
                      onBlur={() => setFocused(null)}
                      placeholder={field.placeholder}
                      required
                      className="w-full px-4 py-3 text-sm font-mono text-white/75 placeholder-white/20 focus:outline-none transition-colors duration-200"
                      animate={{ borderColor: focused === field.name ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)' }}
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-[9px] font-mono uppercase tracking-[0.2em] text-white/25 mb-2">Message</label>
                  <motion.textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    onFocus={() => setFocused('message')}
                    onBlur={() => setFocused(null)}
                    placeholder="What's on your mind?"
                    rows={5}
                    required
                    className="w-full px-4 py-3 text-sm font-mono text-white/75 placeholder-white/20 resize-none focus:outline-none transition-colors duration-200"
                    animate={{ borderColor: focused === 'message' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)' }}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full flex items-center justify-center gap-2.5 py-3 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <><div className="size-3.5 rounded-full border border-black/30 border-t-black/80 animate-spin" />Sending…</>
                  ) : (
                    <><Send className="size-3.5" />Send Message</>
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Alt CTA */}
        <div className="mt-6 text-center">
          <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-3">Or just try it</p>
          <Link href="/debate/new" className="inline-flex items-center gap-2 text-xs font-mono text-white/35 hover:text-white/65 transition-colors group">
            Start debating for free
            <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </motion.div>
    </main>
  )
}
