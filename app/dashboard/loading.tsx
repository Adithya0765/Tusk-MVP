function Bone({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse ${className}`}
      style={{ background: 'rgba(255,255,255,0.06)' }}
    />
  )
}

export default function DashboardLoading() {
  return (
    <main className="min-h-screen relative px-4 py-28 overflow-hidden bg-background">
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
        maskImage: 'radial-gradient(ellipse 90% 60% at 50% 0%, black 0%, transparent 80%)',
      }} />

      <div className="mx-auto max-w-4xl space-y-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="space-y-2">
            <Bone className="h-3 w-24" />
            <Bone className="h-7 w-40" />
          </div>
          <Bone className="h-9 w-28" />
        </div>

        {/* Usage */}
        <div className="p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="space-y-3">
            <div className="flex justify-between">
              <Bone className="h-3 w-24" />
              <Bone className="h-3 w-16" />
            </div>
            <Bone className="h-1.5 w-full" />
            <div className="flex justify-between">
              <Bone className="h-2.5 w-4" />
              <Bone className="h-2.5 w-16" />
              <Bone className="h-2.5 w-4" />
            </div>
          </div>
        </div>

        {/* Sessions */}
        <div>
          <Bone className="h-3 w-32 mb-4" />
          <div className="flex flex-col gap-px bg-white/[0.04]">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="p-4 animate-pulse"
                style={{ animationDelay: `${i * 100}ms`, background: 'rgba(255,255,255,0.02)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <Bone className="h-4 w-3/4" />
                    <Bone className="h-2.5 w-24" />
                  </div>
                  <Bone className="h-5 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
