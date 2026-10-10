import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/motion'
import { MODELS } from '../api'

/** Two infinite rows going opposite ways. Scroll speed accelerates and skews them. */
export function Marquee() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray<HTMLElement>('.mq-track')
      const tweens = rows.map((row, i) =>
        gsap.to(row, { xPercent: i % 2 ? 0 : -50, startAt: { xPercent: i % 2 ? -50 : 0 }, duration: 40, ease: 'none', repeat: -1 }),
      )
      const skew = gsap.quickTo('.mq-row', 'skewX', { duration: 0.5, ease: 'power3' })
      let reset: ReturnType<typeof setTimeout>
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (s) => {
          const v = gsap.utils.clamp(-1, 1, s.getVelocity() / 2500)
          tweens.forEach((t) => t.timeScale(1 + Math.abs(v) * 5))
          skew(v * -8)
          clearTimeout(reset)
          reset = setTimeout(() => {
            tweens.forEach((t) => gsap.to(t, { timeScale: 1, duration: 0.8 }))
            skew(0)
          }, 120)
        },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  const row = (reverse: boolean) => {
    const list = reverse ? [...MODELS].reverse() : MODELS
    const items = [...list, ...list]
    return (
      <div className="mq-row">
        <div className="mq-track">
          {items.map((m, i) => (
            <span className="mq-item" key={i}>
              <span className="dot" style={{ background: m.color, boxShadow: `0 0 14px ${m.color}` }} />
              {m.name}
              <span className="mq-star">✦</span>
            </span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <section ref={root} className="marquee" id="models" aria-label="Supported models">
      <p className="mq-label eyebrow">Powered by every frontier model</p>
      {row(false)}
      {row(true)}
    </section>
  )
}
