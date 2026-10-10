import { useEffect, useRef } from 'react'
import { gsap } from '../lib/motion'
import { Arrow, Magnetic } from '../components/ui'

export default function NotFound() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.nf-digit', { yPercent: 120, rotate: (i) => (i - 1) * 20, stagger: 0.1, duration: 1.2, ease: 'kwoat' })
      gsap.to('.nf-digit', { y: (i) => [-14, 10, -8][i], duration: 2.4, yoyo: true, repeat: -1, ease: 'sine.inOut', stagger: 0.3 })
    }, ref)
    return () => ctx.revert()
  }, [])
  return (
    <div ref={ref} className="nf">
      <div className="nf-num" aria-label="404">
        {'404'.split('').map((d, i) => (
          <span key={i} className="nf-digit">
            {d}
          </span>
        ))}
      </div>
      <p>Even the best router can’t find this page.</p>
      <Magnetic to="/">
        Back home <Arrow />
      </Magnetic>
      <style>{`
        .nf{min-height:100svh;display:grid;place-content:center;justify-items:center;gap:24px;text-align:center;padding:24px}
        .nf-num{display:flex;overflow:hidden;font-size:clamp(120px,28vw,320px);font-weight:750;letter-spacing:-.08em;line-height:.9}
        .nf-digit{display:inline-block;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
        .nf p{color:var(--text-2);font-size:18px}
      `}</style>
    </div>
  )
}
