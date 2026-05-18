'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

export const HeroHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-5"
    >
      <nav
        className="w-full max-w-5xl transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(10,10,15,0.92)' : 'rgba(10,10,15,0.5)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${scrolled ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)'}`,
          borderRadius: '12px',
          boxShadow: scrolled ? '0 1px 0 rgba(255,255,255,0.04), 0 16px 48px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        <div className="flex items-center justify-between px-5 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="flex items-center justify-center size-7 rounded-md"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" stroke="rgba(255,255,255,0.8)" strokeWidth="1.2" fill="none"/>
                <path d="M7 4L10 5.5V8.5L7 10L4 8.5V5.5L7 4Z" fill="rgba(255,255,255,0.6)"/>
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight text-white/90">TUSK</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/debate/new">New Session</NavLink>
            <NavLink href="/#how-it-works">How It Works</NavLink>
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/debate/new"
              className="btn-primary inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm"
            >
              Start Session
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden flex items-center justify-center size-8 rounded-lg transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            aria-label="Toggle menu"
          >
            {menuOpen
              ? <X className="size-4 text-white/70" />
              : <Menu className="size-4 text-white/70" />
            }
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden px-5 pb-4 pt-2 space-y-1 overflow-hidden"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <MobileNavLink href="/dashboard"     onClick={() => setMenuOpen(false)}>Dashboard</MobileNavLink>
              <MobileNavLink href="/debate/new"    onClick={() => setMenuOpen(false)}>New Session</MobileNavLink>
              <MobileNavLink href="/#how-it-works" onClick={() => setMenuOpen(false)}>How It Works</MobileNavLink>
              <div className="pt-2">
                <Link
                  href="/debate/new"
                  onClick={() => setMenuOpen(false)}
                  className="btn-primary flex items-center justify-center w-full py-2.5 rounded-lg text-sm"
                >
                  Start Session
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="nav-link px-3 py-1.5 rounded-md text-sm transition-colors hover:bg-white/5">
      {children}
    </Link>
  )
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="nav-link block px-2 py-2 rounded-md text-sm transition-colors hover:bg-white/5">
      {children}
    </Link>
  )
}
