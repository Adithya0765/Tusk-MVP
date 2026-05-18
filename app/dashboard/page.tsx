import Link from 'next/link'
import { SessionList } from '@/components/dashboard/SessionList'
import { UsageBar } from '@/components/dashboard/UsageBar'
import type { DbSession } from '@/types/index'
import { Plus } from 'lucide-react'
import { DEV_USER_ID, listSessions } from '@/lib/dev-store'

export default function DashboardPage() {
  const sessions = listSessions(DEV_USER_ID)
  const quotaUsed  = sessions.filter(s => s.status === 'complete').length
  const quotaLimit = 3

  return (
    <main className="min-h-screen relative px-4 py-28 overflow-hidden bg-background">
      {/* Fine grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '24px 24px',
        maskImage: 'radial-gradient(ellipse 90% 60% at 50% 0%, black 0%, transparent 80%)',
        zIndex: 0,
      }} />

      <div className="mx-auto max-w-4xl space-y-6 relative z-10">

        {/* Header */}
        <div className="flex items-center justify-between pb-6" style={{
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/25 mb-1">
              // TUSK_DASHBOARD
            </p>
            <h1 className="text-2xl font-bold text-white/90 font-mono tracking-tight uppercase">
              Your Sessions
            </h1>
          </div>
          <Link
            href="/debate/new"
            className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-xs"
          >
            <Plus className="size-3.5" />
            New Session
          </Link>
        </div>

        {/* Usage */}
        <div className="p-5" style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.07)',
        }}>
          <UsageBar used={quotaUsed} limit={quotaLimit} />
        </div>

        {/* Sessions */}
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/25 mb-4">
            Active Executions
          </p>
          <SessionList sessions={sessions as unknown as DbSession[]} />
        </div>

      </div>
    </main>
  )
}
