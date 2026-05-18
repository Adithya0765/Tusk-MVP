'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TIER_CONFIG, type Tier } from '@/types/index'
import { Button } from '@/components/ui/button'
import { Check, Sparkles, Zap, Crown, ChevronRight } from 'lucide-react'

interface PricingTableProps {
  currentTier?: Tier
  isAuthenticated?: boolean
}

const TIER_META: Record<Tier, {
  icon: typeof Sparkles
  iconColor: string
  accentColor: string
  gradientFrom: string
  gradientTo: string
  borderColor: string
  glowColor: string
  badgeGradient: string
  features: string[]
}> = {
  free: {
    icon: Zap,
    iconColor: 'text-violet-400',
    accentColor: 'rgba(139, 92, 246, 0.6)',
    gradientFrom: 'from-violet-600/20',
    gradientTo: 'to-indigo-600/20',
    borderColor: 'border-purple-500/15',
    glowColor: 'rgba(139, 92, 246, 0.15)',
    badgeGradient: '',
    features: [
      'Gemini 2.0 Flash vs Grok 3 Mini',
      'PDF & Markdown export',
      'Shareable debate links',
      'Email notifications',
    ],
  },
  starter: {
    icon: Sparkles,
    iconColor: 'text-blue-400',
    accentColor: 'rgba(59, 130, 246, 0.6)',
    gradientFrom: 'from-blue-600/20',
    gradientTo: 'to-cyan-600/20',
    borderColor: 'border-blue-500/15',
    glowColor: 'rgba(59, 130, 246, 0.15)',
    badgeGradient: '',
    features: [
      'Everything in Explorer',
      'More debate rounds',
      'Priority processing',
      'Debate history',
    ],
  },
  pro: {
    icon: Crown,
    iconColor: 'text-amber-400',
    accentColor: 'rgba(245, 158, 11, 0.6)',
    gradientFrom: 'from-amber-500/20',
    gradientTo: 'to-orange-500/20',
    borderColor: 'border-amber-500/20',
    glowColor: 'rgba(245, 158, 11, 0.2)',
    badgeGradient: 'from-amber-500 to-orange-500',
    features: [
      'Everything in Builder',
      'Maximum debate rounds',
      'Unlimited debate history',
      'Early access to new models',
    ],
  },
}

export function PricingTable({ currentTier, isAuthenticated }: PricingTableProps) {
  const router = useRouter()

  async function handleUpgrade(tier: Tier) {
    if (!isAuthenticated) {
      router.push('/sign-up')
      return
    }
    const res = await fetch('/api/subscription/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier }),
    })
    if (res.ok) {
      const { url } = await res.json()
      router.push(url)
    }
  }

  const tiers: Tier[] = ['free', 'starter', 'pro']

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 items-start">
      {tiers.map((tier) => {
        const config = TIER_CONFIG[tier]
        const meta = TIER_META[tier]
        const isPro = tier === 'pro'
        const isCurrent = currentTier === tier
        const Icon = meta.icon

        return (
          <div
            key={tier}
            className={`relative rounded-2xl transition-all duration-500 hover:-translate-y-2 ${isPro ? 'md:scale-105 md:z-10' : ''}`}
            style={{
              background: 'linear-gradient(135deg, rgba(15,10,30,0.85) 0%, rgba(20,15,40,0.7) 100%)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${isPro ? 'rgba(245,158,11,0.25)' : 'rgba(139,92,246,0.15)'}`,
              boxShadow: isPro
                ? `0 0 0 1px rgba(245,158,11,0.1), 0 20px 60px rgba(245,158,11,0.1), inset 0 1px 0 rgba(255,255,255,0.05)`
                : `0 20px 60px rgba(139,92,246,0.08), inset 0 1px 0 rgba(255,255,255,0.03)`,
            }}
          >
            {/* Top glow line */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 h-px rounded-full opacity-60"
              style={{
                width: '60%',
                background: `linear-gradient(90deg, transparent, ${meta.accentColor}, transparent)`,
              }}
            />

            {/* Most Popular badge */}
            {isPro && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r ${meta.badgeGradient}`}
                  style={{ boxShadow: '0 0 20px rgba(245,158,11,0.5)' }}
                >
                  <Sparkles className="size-3" />
                  Most Popular
                </span>
              </div>
            )}

            <div className="p-7">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`flex items-center justify-center size-12 rounded-xl bg-gradient-to-br ${meta.gradientFrom} ${meta.gradientTo}`}
                  style={{ border: `1px solid ${meta.glowColor}` }}
                >
                  <Icon className={`size-6 ${meta.iconColor}`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{config.label}</h3>
                  <p className="text-xs text-purple-300/50 font-mono uppercase tracking-wider">{tier}</p>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-5xl font-black tracking-tight"
                    style={{
                      background: isPro
                        ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                        : tier === 'starter'
                        ? 'linear-gradient(135deg, #60a5fa, #3b82f6)'
                        : 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {config.priceINR === 0 ? 'Free' : `₹${config.priceINR}`}
                  </span>
                  {config.priceINR > 0 && (
                    <span className="text-sm text-purple-300/40 font-medium">/month</span>
                  )}
                </div>
                {config.priceINR === 0 && (
                  <p className="text-xs text-purple-300/40 mt-1">No credit card required</p>
                )}
              </div>

              {/* Quota & Rounds stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div
                  className="rounded-xl px-3 py-3 text-center"
                  style={{
                    background: 'rgba(139,92,246,0.06)',
                    border: '1px solid rgba(139,92,246,0.12)',
                  }}
                >
                  <p className="text-xl font-bold text-white">{config.quotaLimit}</p>
                  <p className="text-xs text-purple-300/50 mt-0.5">debates/mo</p>
                </div>
                <div
                  className="rounded-xl px-3 py-3 text-center"
                  style={{
                    background: 'rgba(139,92,246,0.06)',
                    border: '1px solid rgba(139,92,246,0.12)',
                  }}
                >
                  <p className="text-xl font-bold text-white">{config.rounds}</p>
                  <p className="text-xs text-purple-300/50 mt-0.5">rounds</p>
                </div>
              </div>

              {/* Divider */}
              <div
                className="h-px mb-6"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.2), transparent)' }}
              />

              {/* Features */}
              <ul className="space-y-3 mb-7">
                {meta.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-white/75">
                    <div
                      className="flex items-center justify-center size-5 rounded-full shrink-0 mt-0.5"
                      style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)' }}
                    >
                      <Check className="size-3 text-green-400" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {tier === 'free' ? (
                isCurrent ? (
                  <Button
                    variant="outline"
                    disabled
                    className="w-full"
                    style={{ borderColor: 'rgba(139,92,246,0.2)', color: 'rgba(167,139,250,0.5)' }}
                  >
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    asChild
                    className="w-full group"
                    style={{ borderColor: 'rgba(139,92,246,0.3)', color: '#a78bfa' }}
                  >
                    <Link href="/sign-up">
                      Get Started Free
                      <ChevronRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </Button>
                )
              ) : isCurrent ? (
                <Button
                  variant="outline"
                  disabled
                  className="w-full"
                  style={{ borderColor: 'rgba(139,92,246,0.2)', color: 'rgba(167,139,250,0.5)' }}
                >
                  Current Plan
                </Button>
              ) : (
                <button
                  onClick={() => handleUpgrade(tier)}
                  className="w-full group relative overflow-hidden rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: isPro
                      ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                      : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                    boxShadow: isPro
                      ? '0 0 30px rgba(245,158,11,0.35)'
                      : '0 0 30px rgba(124,58,237,0.35)',
                  }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isAuthenticated ? 'Upgrade Now' : 'Get Started'}
                    <ChevronRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                  {/* Shimmer overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                    }}
                  />
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
