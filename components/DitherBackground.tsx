'use client'

import dynamic from 'next/dynamic'

const Dither = dynamic(() => import('@/components/Dither'), { ssr: false })

interface DitherBackgroundProps {
  waveColor?: [number, number, number]
  disableAnimation?: boolean
  enableMouseInteraction?: boolean
  mouseRadius?: number
  colorNum?: number
  pixelSize?: number
  waveAmplitude?: number
  waveFrequency?: number
  waveSpeed?: number
}

export default function DitherBackground(props: DitherBackgroundProps) {
  return <Dither {...props} />
}
