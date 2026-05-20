import type { Metadata } from 'next'
import { PricingTable } from '@/components/shared/PricingTable'

export const metadata: Metadata = {
  title: 'Pricing — TUSK',
  description: 'Simple, transparent pricing. Start free, upgrade when you need more.',
}

export default function PricingPage() {
  return (
    <main className="min-h-screen relative px-4 py-28 overflow-hidden bg-background">
      {/* Grid background */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '24px 24px',
        maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 80%)',
      }} />

      <div className="mx-auto max-w-5xl relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/25 mb-4">
            // PRICING
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-white/90 font-mono tracking-tight uppercase mb-4">
            Simple pricing.
          </h1>
          <p className="text-sm font-mono text-white/40 max-w-md mx-auto leading-relaxed">
            Start free. No credit card required. Upgrade when you need more sessions or rounds.
          </p>
        </div>

        {/* Pricing table */}
        <PricingTable />

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto space-y-px">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/25 mb-6 text-center">
            // FAQ
          </p>
          {[
            {
              q: 'What counts as a session?',
              a: 'One session = one debate or idea refinement run, regardless of how many rounds it has.',
            },
            {
              q: 'Do unused sessions roll over?',
              a: 'No — sessions reset on the 1st of each month.',
            },
            {
              q: 'Can I cancel anytime?',
              a: 'Yes. Cancel from your account settings and you keep access until the end of the billing period.',
            },
            {
              q: 'What payment methods are accepted?',
              a: 'All major credit and debit cards via Stripe. Payments are secure and encrypted.',
            },
            {
              q: 'Is there a free trial for paid plans?',
              a: 'The free plan is your trial — 3 sessions every month, no time limit.',
            },
          ].map(({ q, a }) => (
            <div
              key={q}
              className="px-5 py-4"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <p className="text-xs font-mono text-white/70 font-semibold mb-1.5">{q}</p>
              <p className="text-xs font-mono text-white/35 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
