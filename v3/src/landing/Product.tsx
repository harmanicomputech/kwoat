import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/motion'
import { Icon, Mark } from '../components/ui'
import { useInView } from '../lib/hooks'
import { MODELS } from '../api'

const REPLY =
  'Here’s a single-file landing page: a full-bleed hero with your roast photography, a three-column origin story, a subscription picker and a footer with opening hours. The live preview is open on the right — tell me what to change.'

/** The app window, tilted back in space, that settles flat as you scroll. */
export function Product() {
  const root = useRef<HTMLElement>(null)
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.35 })
  const [typed, setTyped] = useState(0)

  useEffect(() => {
    const mm = gsap.matchMedia()
    const ctx = gsap.context(() => {
      mm.add('(min-width: 800px)', () => {
        gsap.fromTo(
          '.pw',
          { rotateX: 32, scale: 0.86, y: -40 },
          {
            rotateX: 0,
            scale: 1,
            y: 0,
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top 95%', end: 'top 15%', scrub: 0.6 },
          },
        )
        gsap.fromTo('.pw-glow', { opacity: 0.2 }, { opacity: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 90%', end: 'top 20%', scrub: true } })
      })
    }, root)
    return () => {
      ctx.revert()
      mm.revert()
    }
  }, [])

  useEffect(() => {
    if (!inView || typed >= REPLY.length) return
    const t = setTimeout(() => setTyped((n) => Math.min(REPLY.length, n + 3 + Math.floor(Math.random() * 4))), 28)
    return () => clearTimeout(t)
  }, [inView, typed])

  return (
    <section ref={root} className="product" id="product">
      <div className="container pw-stage">
        <div className="pw-glow" aria-hidden />
        <div ref={ref} className="pw" role="img" aria-label="The Kwoat app: a conversation routed to Claude Sonnet 4.6">
          <div className="pw-chrome">
            <span />
            <span />
            <span />
            <div className="pw-url">kwoat.ai/app</div>
          </div>
          <div className="pw-body">
            <aside className="pw-side">
              <Mark size={20} />
              <span className="pw-new">
                <Icon name="plus" size={16} />
              </span>
              {(['chat', 'compare', 'image', 'rocket', 'mic', 'chart'] as const).map((n, i) => (
                <span key={n} className={`pw-ic ${i === 0 ? 'is-on' : ''}`}>
                  <Icon name={n} size={16} />
                </span>
              ))}
              <span className="pw-av">A</span>
            </aside>
            <div className="pw-main">
              <div className="pw-top">
                <span className="pw-mode">
                  <i /> Auto mode
                </span>
                <div className="pw-credits">
                  <span>
                    <i style={{ background: '#a78bfa' }} />
                    Std <b>5,495</b>
                  </span>
                  <span>
                    <i style={{ background: '#60a5fa' }} />
                    Adv <b>2,000</b>
                  </span>
                  <span>
                    <i style={{ background: '#f472b6' }} />
                    Prm <b>0</b>
                  </span>
                </div>
              </div>
              <div className="pw-thread">
                <div className="pw-user">Build a landing page for my coffee brand — warm, minimal, with a subscription option.</div>
                <div className="pw-meta">
                  <span className="pw-route">
                    <Mark size={12} /> Routed to <b>Claude Sonnet 4.6</b>
                  </span>
                  <span className="pw-why">Web build → strongest at code + live preview</span>
                  <span className="pw-cost">6 cr</span>
                </div>
                <div className="pw-reply">
                  {REPLY.slice(0, typed)}
                  {typed < REPLY.length && <span className="caret" />}
                </div>
                <div className={`pw-preview ${typed >= REPLY.length ? 'is-on' : ''}`}>
                  <div className="pwp-hero">
                    <b>Ember &amp; Oak</b>
                    <span>Small-batch coffee, roasted Tuesdays.</span>
                    <i />
                  </div>
                  <div className="pwp-cols">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
              <div className="pw-composer">
                <span>Ask anything — best model selected automatically…</span>
                <span className="pw-chip">
                  <i /> Auto
                </span>
                <span className="pw-send">
                  <Icon name="send" size={14} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container models-row">
        <p className="models-label">One subscription. Every frontier model.</p>
        <div className="models-track" aria-label="Supported models">
          <div className="models-inner">
            {[...MODELS, ...MODELS].map((m, i) => (
              <span key={i} aria-hidden={i >= MODELS.length}>
                {m.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
