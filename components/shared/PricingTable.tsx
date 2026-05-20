'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TIER_CONFIG, type Tier } from '@/types/index'
import { Check, ChevronRight, Zap, Users, Crown } from 'lucide-react'
import { motion } from 'motion/react'

interface PricingTableProps {
  currentTier?: Tier
  isAuthenticated?: boolean
}

const TIER_META: Record<Tier, {
  icon: typeof Zap
  tagline: string
  features: string[]
  highlight: boolean
}> = {
  free: {
    icon: Zap,
    tagline: 'Try it out, no strings attached.',
    features: [
      '3 sessions per month',
      '3 rounds per session',
      'Debate & Idea Refinement modes',
      'PDF & Markdown export',
      'Shareable session links',
    ],
    highlight: false,
  },
  starter: {
    icon: Users,
    tagline: 'For builders who think daily.',
    features: [
      '30 sessions per month',
      '4 rounds per session',
      'Everything in Explorer',
      'PRD generation for ideas',
      'Priority processing',
    ],
    highlight: true,
  },
  pro: {
    icon: Crown,
    tagline: 'Maximum depth, maximum output.',
    features: [
      '100 sessions per month',
      '6 rounds per session',
      'Everything in Community',
      'Early access to new models',
      'Debate history & search',
    ],
    highlight: false,
  },
}

export function PricingTable({ currentTier, isAuthenticated }: PricingTableProps) {
  const router = useRouter()

  async function handleUpgrade(tier: Tier) {
    if (!isAuthenticated) {
      router.push('/sign-up')
      return
    }
    const config = TIER_CONFIG[tier]
    // If we have the LS URL directly, skip the API call and go straight there
    if (config.lemonSqueezyUrl) {
      window.location.href = config.lemonSqueezyUrl
      return
    }
    const res = await fetch('/api/subscription/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier }),
    })
    if (res.ok) {
      const { url } = await res.json()
      if (url) window.location.href = url
    }
  }

  const tiers: Tier[] = ['free', 'starter', 'pro']

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.06]">
      {tiers.map((tier, i) => {
        const config = TIER_CONFIG[tier]
        const meta = TIER_META[tier]
        const isCurrent = currentTier === tier
        const Icon = meta.icon

        return (
          <motion.div
            key={tier}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08, ease: [0.23, 1, 0.32, 1] }}
            className="relative flex flex-col"
            style={{
              background: meta.highlight
                ? 'rgba(255,255,255,0.04)'
                : 'rgba(255,255,255,0.015)',
            }}
          >
            {/* Highlight top line */}
            {meta.highlight && (
              <div className="absolute top-0 left-0 right-0 h-px" style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              }} />
            )}

            {/* Most popular badge */}
            {meta.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <span className="inline-flex items-center gap-1 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-black font-bold bg-white">
                  Most Popular
                </span>
              </div>
            )}

            <div className="p-8 flex flex-col flex-1">
              {/* Icon + label */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center size-9" style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>
                  <Icon className="size-4 text-white/60" />
                </div>
                <div>
                  <p className="text-sm font-mono font-bold text-white/90 uppercase tracking-wider">
                    {config.label}
                  </p>
                  <p className="text-[10px] font-mono text-white/30">{meta.tagline}</p>
                </div>
              </div>

              {/* Price */}
              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black font-mono text-white/90">
                    {config.priceUSD === 0 ? 'Free' : `$${config.priceUSD}`}
                  </span>
                  {config.priceUSD > 0 && (
                    <span className="text-sm font-mono text-white/30">/mo</span>
                  )}
                </div>
                {config.priceUSD === 0 && (
                  <p className="text-[10px] font-mono text-white/25 mt-1 uppercase tracking-widest">
                    No card required
                  </p>
                )}
                {config.priceUSD > 0 && (
                  <p className="text-[10px] font-mono text-white/25 mt-1 uppercase tracking-widest">
                    Billed monthly · Cancel anytime
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mb-8">
                {[
                  { value: config.quotaLimit === 9999 ? '∞' : String(config.quotaLimit), label: 'sessions/mo' },
                  { value: String(config.rounds), label: 'rounds' },
                ].map(stat => (
                  <div key={stat.label} className="px-3 py-2.5 text-center" style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}>
                    <p className="text-lg font-black font-mono text-white/90">{stat.value}</p>
                    <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-8 flex-1">
                {meta.features.map((feature, fi) => (
                  <li key={fi} className="flex items-start gap-2.5 text-xs font-mono text-white/55">
                    <Check className="size-3.5 shrink-0 mt-0.5 text-white/30" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {tier === 'free' ? (
                isCurrent ? (
                  <div className="w-full py-3 text-center text-xs font-mono text-white/25 uppercase tracking-widest" style={{
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    Current Plan
                  </div>
                ) : (
                  <Link
                    href="/sign-up"
                    className="group w-full flex items-center justify-center gap-2 py-3 text-xs font-mono uppercase tracking-widest text-white/60 hover:text-white/90 transition-colors"
                    style={{ border: '1px solid rgba(255,255,255,0.12)' }}
                  >
                    Get Started Free
                    <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                )
              ) : isCurrent ? (
                <div className="w-full py-3 text-center text-xs font-mono text-white/25 uppercase tracking-widest" style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  Current Plan
                </div>
              ) : (
                <button
                  onClick={() => handleUpgrade(tier)}
                  className="btn-primary group w-full flex items-center justify-center gap-2 py-3 text-xs"
                >
                  {isAuthenticated ? 'Upgrade Now' : 'Get Started'}
                  <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
