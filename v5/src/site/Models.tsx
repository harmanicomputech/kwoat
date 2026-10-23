import { useLayoutEffect, useRef, useState } from 'react'
import { gsap, Flip } from '../lib/motion'
import { Icon } from '../components/ui'
import { MODELS, type Model } from '../api'
import { Seg } from '../app/kit'

type Filter = 'all' | 'standard' | 'advanced' | 'premium' | 'media'
const match = (m: Model, f: Filter) =>
  f === 'all' ? true : f === 'media' ? m.strengths.some((s) => s === 'images' || s === 'video') : m.tier === f && !m.strengths.some((s) => s === 'images' || s === 'video')

const STATS = [
  { v: 13, suffix: '+', label: 'AI models' },
  { v: 50, suffix: '', label: 'Free credits daily' },
  { v: 1, suffix: '', label: 'Wallet for all of it' },
  { v: 0, suffix: '', label: 'Subscriptions required' },
]

export function Models() {
  const grid = useRef<HTMLDivElement>(null)
  const state = useRef<Flip.FlipState | null>(null)
  const [f, setF] = useState<Filter>('all')
  const stats = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!state.current) return
    Flip.from(state.current, {
      duration: 0.7,
      ease: 'kwoat',
      scale: true,
      absolute: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.5 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.85, duration: 0.35 }),
    })
    state.current = null
  }, [f])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.md5-stat b').forEach((el) => {
        const end = Number(el.dataset.v)
        const o = { v: 0 }
        gsap.to(o, { v: end, duration: 1.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true }, onUpdate: () => (el.textContent = Math.round(o.v) + (el.dataset.s ?? '')) })
      })
    }, stats)
    return () => ctx.revert()
  }, [])

  const pick = (v: Filter) => {
    if (grid.current) state.current = Flip.getState(grid.current.children)
    setF(v)
  }

  return (
    <section className="md5 sec5" id="models">
      <div className="container">
        <div className="sec5-head">
          <span className="kick5" data-reveal>
            <Icon name="layers" size={14} /> The line-up
          </span>
          <h2 data-split>Every frontier model, one prompt box.</h2>
          <p data-reveal>New models are added as they launch. You never need another subscription to try them.</p>
        </div>
        <div className="md5-filter" data-reveal>
          <Seg<Filter>
            value={f}
            onChange={pick}
            options={[
              { id: 'all', label: 'All' },
              { id: 'standard', label: 'Standard' },
              { id: 'advanced', label: 'Advanced' },
              { id: 'premium', label: 'Premium' },
              { id: 'media', label: 'Image & video' },
            ]}
          />
        </div>
        <div ref={grid} className="md5-grid">
          {MODELS.filter((m) => match(m, f)).map((m) => (
            <ModelCard key={m.id} m={m} />
          ))}
        </div>

        <div ref={stats} className="md5-stats" data-reveal>
          {STATS.map((s) => (
            <div key={s.label} className="md5-stat">
              <b data-v={s.v} data-s={s.suffix}>
                0
              </b>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ModelCard({ m }: { m: Model }) {
  const ref = useRef<HTMLDivElement>(null)
  const move = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect()
    ref.current!.style.setProperty('--x', `${e.clientX - r.left}px`)
    ref.current!.style.setProperty('--y', `${e.clientY - r.top}px`)
  }
  return (
    <div ref={ref} className="md5-card" style={{ ['--c' as string]: m.color }} onPointerMove={move} data-flip-id={m.id}>
      <span className="md5-glow" aria-hidden />
      <header>
        <span className="md5-ico">{m.vendor[0]}</span>
        <span className={`md5-tier ${m.tier}`}>{m.tier}</span>
      </header>
      <b>{m.name}</b>
      <small>{m.vendor}</small>
      <div className="md5-tags">
        {m.strengths.map((s) => (
          <span key={s}>{s}</span>
        ))}
      </div>
      <footer>
        <Icon name="bolt" size={12} /> ~{m.cost} credit{m.cost > 1 ? 's' : ''} per reply
      </footer>
    </div>
  )
}
