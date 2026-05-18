'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'motion/react'

interface TypewriterTextProps {
  text: string
  speed?: number
  delay?: number
  className?: string
  cursorChar?: string
  cursorClassName?: string
  onComplete?: () => void
  startOnMount?: boolean
}

export function TypewriterText({
  text,
  speed = 20,
  delay = 0,
  className = '',
  cursorChar = '|',
  cursorClassName = '',
  onComplete,
  startOnMount = true,
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const indexRef = useRef(0)
  const textRef = useRef(text)

  useEffect(() => {
    textRef.current = text
    indexRef.current = 0
    setDisplayed('')
    setIsComplete(false)
  }, [text])

  useEffect(() => {
    if (!startOnMount) return

    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        const currentIndex = indexRef.current
        const fullText = textRef.current

        if (currentIndex < fullText.length) {
          setDisplayed(fullText.slice(0, currentIndex + 1))
          indexRef.current = currentIndex + 1
        } else {
          setIsComplete(true)
          clearInterval(interval)
          onComplete?.()
        }
      }, speed)

      return () => clearInterval(interval)
    }, delay)

    return () => clearTimeout(timeout)
  }, [speed, delay, onComplete, startOnMount])

  return (
    <span className={className}>
      {displayed}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
          className={cursorClassName || 'text-white/50'}
        >
          {cursorChar}
        </motion.span>
      )}
    </span>
  )
}
