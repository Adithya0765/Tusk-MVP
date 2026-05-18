function Bone({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse ${className}`}
      style={{ background: 'rgba(255,255,255,0.06)' }}
    />
  )
}

export default function DebateLoading() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
        backgroundSize: '24px 24px',
        maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 0%, transparent 80%)',
      }} />

      <div className="max-w-3xl mx-auto px-4 py-28 space-y-6 relative z-10">
        {/* Back + topic */}
        <div className="flex items-start gap-4">
          <Bone className="size-9 shrink-0 mt-1" />
          <div className="flex-1 space-y-2">
            <Bone className="h-6 w-2/3" />
            <Bone className="h-2.5 w-32" />
          </div>
        </div>

        {/* Agent legend */}
        <div className="grid grid-cols-2 gap-px bg-white/[0.06]">
          <Bone className="h-14" />
          <Bone className="h-14" />
        </div>

        {/* Spinner */}
        <div className="flex flex-col items-center justify-center gap-5 py-16">
          <div className="relative size-14">
            <div className="absolute inset-0 rounded-full animate-spin" style={{
              border: '1px solid rgba(255,255,255,0.08)',
              borderTopColor: 'rgba(255,255,255,0.5)',
              animationDuration: '1s',
            }} />
            <div className="absolute inset-2.5 rounded-full animate-spin" style={{
              border: '1px solid rgba(255,255,255,0.05)',
              borderRightColor: 'rgba(255,255,255,0.3)',
              animationDuration: '1.6s',
              animationDirection: 'reverse',
            }} />
            <div className="absolute inset-[30%] rounded-full animate-pulse" style={{
              background: 'rgba(255,255,255,0.1)',
            }} />
          </div>
          <Bone className="h-3 w-32" />
        </div>

        {/* Turn skeletons */}
        <div className="space-y-4">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className="w-[82%] p-4 space-y-2.5 animate-pulse"
                style={{
                  animationDelay: `${i * 120}ms`,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div className="flex items-center gap-3">
                  <Bone className="h-5 w-14" />
                  <Bone className="h-3.5 w-20" />
                  <Bone className="h-2.5 w-12 ml-auto" />
                </div>
                <Bone className="h-3 w-full" />
                <Bone className="h-3 w-5/6" />
                <Bone className="h-3 w-4/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
