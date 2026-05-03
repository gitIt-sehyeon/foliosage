'use client'
import { useEffect, useRef, useState } from 'react'

interface Props {
  target: number
  duration?: number
  className?: string
}

export default function CountUpNumber({ target, duration = 600, className }: Props) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const start = performance.now()
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const progress = 1 - Math.pow(1 - t, 3) // ease-out cubic
      setValue(Math.round(progress * target))
      if (t < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return <span className={className}>{value.toLocaleString()}</span>
}
