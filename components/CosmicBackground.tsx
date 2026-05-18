'use client'

import { useEffect, useState, useMemo } from 'react'

interface Star {
  id: number
  left: number
  top: number
  size: number
  duration: number
  delay: number
  opacity: number
}

interface NebulaBlob {
  id: number
  left: number
  top: number
  size: number
  color: string
  duration: number
  delay: number
}

export function CosmicBackground() {
  const [stars, setStars] = useState<Star[]>([])
  const [nebulaBlobs, setNebulaBlobs] = useState<NebulaBlob[]>([])

  useEffect(() => {
    const generatedStars = Array.from({ length: 150 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 4 + 3,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.7 + 0.3,
    }))
    setStars(generatedStars)

    const generatedBlobs: NebulaBlob[] = [
      { id: 0, left: 20, top: 30, size: 600, color: 'rgba(88, 28, 135, 0.15)', duration: 20, delay: 0 },
      { id: 1, left: 70, top: 20, size: 500, color: 'rgba(59, 130, 246, 0.12)', duration: 25, delay: 2 },
      { id: 2, left: 40, top: 70, size: 550, color: 'rgba(168, 85, 247, 0.1)', duration: 22, delay: 4 },
      { id: 3, left: 80, top: 60, size: 450, color: 'rgba(139, 92, 246, 0.08)', duration: 18, delay: 1 },
    ]
    setNebulaBlobs(generatedBlobs)
  }, [])

  const starElements = useMemo(() => {
    return stars.map((star) => (
      <div
        key={star.id}
        className="absolute rounded-full bg-white animate-twinkle"
        style={{
          left: `${star.left}%`,
          top: `${star.top}%`,
          width: `${star.size}px`,
          height: `${star.size}px`,
          opacity: star.opacity,
          animationDuration: `${star.duration}s`,
          animationDelay: `${star.delay}s`,
        }}
      />
    ))
  }, [stars])

  const nebulaElements = useMemo(() => {
    return nebulaBlobs.map((blob) => (
      <div
        key={blob.id}
        className="absolute rounded-full blur-3xl"
        style={{
          left: `${blob.left}%`,
          top: `${blob.top}%`,
          width: `${blob.size}px`,
          height: `${blob.size}px`,
          backgroundColor: blob.color,
          transform: 'translate(-50%, -50%)',
          animation: `nebula-pulse ${blob.duration}s ease-in-out ${blob.delay}s infinite`,
        }}
      />
    ))
  }, [nebulaBlobs])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,10,30,0.8)_0%,rgba(8,5,15,1)_100%)]" />
      
      {nebulaElements}
      
      <div className="absolute inset-0">
        {starElements}
      </div>

      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 40% 70%, rgba(255,255,255,0.6), transparent),
            radial-gradient(1.5px 1.5px at 60% 20%, rgba(255,255,255,0.9), transparent),
            radial-gradient(1px 1px at 80% 50%, rgba(255,255,255,0.7), transparent),
            radial-gradient(1.5px 1.5px at 10% 80%, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 90% 10%, rgba(255,255,255,0.6), transparent)
          `,
          backgroundSize: '200px 200px',
        }}
      />
    </div>
  )
}
