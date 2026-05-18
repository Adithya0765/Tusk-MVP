interface CosmicOrbProps {
  color?: string
  size?: number
  duration?: number
  className?: string
}

export function CosmicOrb({
  color = 'rgba(139, 92, 246, 0.4)',
  size = 300,
  duration = 8,
  className = '',
}: CosmicOrbProps) {
  return (
    <div
      className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        willChange: 'transform',
        animation: `orb-float ${duration}s ease-in-out infinite`,
      }}
    />
  )
}
