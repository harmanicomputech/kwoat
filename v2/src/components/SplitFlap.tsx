import { memo, useEffect, useRef, useState } from 'react'

const CHARS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-→·/$%'

/**
 * Airport-board text. When `value` changes each cell steps through the
 * character drum until it lands on its target, left to right.
 */
export const SplitFlap = memo(function SplitFlap({
  value,
  length,
  className = '',
  speed = 32,
  stagger = 2,
}: {
  value: string
  length?: number
  className?: string
  speed?: number
  stagger?: number
}) {
  const len = length ?? value.length
  const target = value.toUpperCase().padEnd(len, ' ').slice(0, len)
  return (
    <span className={`flap ${className}`} aria-label={value}>
      {Array.from(target).map((ch, i) => (
        <Cell key={i} target={ch} delay={i * stagger} speed={speed} />
      ))}
    </span>
  )
})

function Cell({ target, delay, speed }: { target: string; delay: number; speed: number }) {
  const [ch, setCh] = useState(' ')
  const [flip, setFlip] = useState(0)
  const cur = useRef(' ')

  useEffect(() => {
    if (cur.current === target) return
    let steps = delay
    let idx = Math.max(0, CHARS.indexOf(cur.current))
    const targetIdx = CHARS.indexOf(target)
    const id = setInterval(() => {
      if (steps-- > 0) return
      if (targetIdx === -1) {
        cur.current = target
        setCh(target)
        setFlip((f) => f + 1)
        clearInterval(id)
        return
      }
      idx = (idx + 1) % CHARS.length
      cur.current = CHARS[idx]
      setCh(CHARS[idx])
      setFlip((f) => f + 1)
      if (idx === targetIdx) clearInterval(id)
    }, speed)
    return () => clearInterval(id)
  }, [target, delay, speed])

  return (
    <span className="flap-cell" aria-hidden>
      <span key={flip} className="flap-ch">
        {ch === ' ' ? ' ' : ch}
      </span>
    </span>
  )
}
