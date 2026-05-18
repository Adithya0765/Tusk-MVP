'use client'

import Link from 'next/link'
import { motion } from 'motion/react'

const NAV_LINKS = [
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Dashboard',    href: '/dashboard' },
  { label: 'New Debate',   href: '/debate/new' },
  { label: 'About',        href: '/about' },
]
const LEGAL_LINKS = [
  { label: 'Terms',   href: '/terms' },
  { label: 'Privacy', href: '/privacy' },
]

export default function FooterSection() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden py-12"
    >
      <div className="absolute top-0 left-0 right-0 h-px" style={{
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)',
      }} />

      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="flex items-center justify-center size-6"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" fill="none"/>
                <path d="M7 4L10 5.5V8.5L7 10L4 8.5V5.5L7 4Z" fill="rgba(255,255,255,0.4)"/>
              </svg>
            </motion.div>
            <span className="text-xs font-mono text-white/40 uppercase tracking-widest">TUSK</span>
          </Link>

          {/* Nav */}
          <div className="flex flex-wrap justify-center gap-6">
            {NAV_LINKS.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Link href={link.href} className="footer-link text-xs font-mono uppercase tracking-widest">
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Legal + copyright */}
          <div className="flex items-center gap-5">
            {LEGAL_LINKS.map(link => (
              <Link key={link.href} href={link.href} className="footer-link text-[10px] font-mono uppercase tracking-widest">
                {link.label}
              </Link>
            ))}
            <span className="text-[10px] font-mono text-white/15">© 2026</span>
          </div>

        </div>
      </div>
    </motion.footer>
  )
}
