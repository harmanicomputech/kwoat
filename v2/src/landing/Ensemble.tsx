import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/motion'
import { isTouch } from '../lib/motion'
import { MODELS, type Model } from '../api'
import { Section } from '../components/ui'

// An index of every model, set like a book's contents page. Hovering a row
// brings up a spec card that trails the cursor.
const ROWS = MODELS

export function Ensemble() {
  const root = useRef<HTMLElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<Model | null>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.ens-intro .ens-h .ch', {
        yPercent: 105,
        duration: 1.4,
        ease: 'kwoat',
        stagger: 0.02,
        scrollTrigger: { trigger: '.ens-intro', start: 'top 75%' },
      })
      gsap.utils.toArray<HTMLElement>('.ens-row').forEach((row) => {
        gsap.from(row.querySelector('.ens-line'), {
          scaleX: 0,
          transformOrigin: 'left',
          duration: 1.4,
          ease: 'kwoat',
          scrollTrigger: { trigger: row, start: 'top 90%' },
        })
        gsap.from(row.querySelectorAll('.ens-cell'), {
          yPercent: 60,
          opacity: 0,
          duration: 1.1,
          ease: 'kwoat',
          stagger: 0.05,
          scrollTrigger: { trigger: row, start: 'top 90%' },
        })
      })
    }, root)

    const c = card.current!
    if (isTouch()) return () => ctx.revert()
    const x = gsap.quickTo(c, 'x', { duration: 0.6, ease: 'power3' })
    const y = gsap.quickTo(c, 'y', { duration: 0.6, ease: 'power3' })
    const r = gsap.quickTo(c, 'rotate', { duration: 0.8, ease: 'power3' })
    let lastX = 0
    const move = (e: PointerEvent) => {
      x(e.clientX + 24)
      y(e.clientY - 120)
      r(gsap.utils.clamp(-8, 8, (e.clientX - lastX) * 0.6))
      lastX = e.clientX
    }
    window.addEventListener('pointermove', move)
    return () => {
      window.removeEventListener('pointermove', move)
      ctx.revert()
    }
  }, [])

  useEffect(() => {
    gsap.to(card.current, { scale: hover ? 1 : 0.6, opacity: hover ? 1 : 0, duration: 0.5, ease: 'kwoat' })
  }, [hover])

  return (
    <Section id="ensemble" index="01" title="The ensemble" className="ensemble">
      <div ref={root as never} className="container">
        <div className="ens-intro">
          <h2 className="ens-h display">
            {'Thirteen minds,'.split('').map((c, i) => (
              <span className="ch-mask" key={i}>
                <span className="ch">{c === ' ' ? ' ' : c}</span>
              </span>
            ))}
            <br />
            <em>
              {'one conductor.'.split('').map((c, i) => (
                <span className="ch-mask" key={i}>
                  <span className="ch">{c === ' ' ? ' ' : c}</span>
                </span>
              ))}
            </em>
          </h2>
          <p className="ens-lede">
            Every frontier model sits behind the same prompt box. You don’t pick — Kwoat does, per prompt, and tells you why.
          </p>
        </div>

        <div className="ens-head label" aria-hidden>
          <span>No.</span>
          <span>Model</span>
          <span>Maker</span>
          <span>Best at</span>
          <span>Tier</span>
          <span>~Credits</span>
        </div>
        <ul className="ens-list" onMouseLeave={() => setHover(null)}>
          {ROWS.map((m, i) => (
            <li key={m.id} className="ens-row" onMouseEnter={() => setHover(m)} data-cursor="View">
              <span className="ens-line" />
              <span className="ens-cell ens-no label">{String(i + 1).padStart(2, '0')}</span>
              <span className="ens-cell ens-name display">
                {m.name}
                <i className="ens-swatch" style={{ background: m.color }} />
              </span>
              <span className="ens-cell label">{m.vendor}</span>
              <span className="ens-cell ens-best">{m.strengths.join(', ')}</span>
              <span className="ens-cell label">{m.tier}</span>
              <span className="ens-cell ens-cost">{m.cost}</span>
            </li>
          ))}
        </ul>
      </div>

      <div ref={card} className="ens-card" aria-hidden>
        {hover && (
          <>
            <div className="ens-card-art" style={{ ['--c' as string]: hover.color }}>
              <span className="display">{hover.name.split(' ')[0]}</span>
            </div>
            <div className="ens-card-meta">
              <span className="label">
                <b>{hover.vendor}</b>
              </span>
              <span className="label">{hover.tier}</span>
            </div>
            <p>
              Routed here for <b>{hover.strengths[0]}</b>. Typical reply costs ~{hover.cost} credit{hover.cost === 1 ? '' : 's'}.
            </p>
          </>
        )}
      </div>
    </Section>
  )
}
