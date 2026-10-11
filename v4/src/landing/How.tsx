import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../lib/motion'
import { Mark } from '../components/ui'
import { MODELS } from '../api'

// Pinned scroll scene. Prompt cards drift in from every edge at different
// depths (parallax), get pulled into the Kwoat mark, the mark charges up,
// then a beam drops to the chosen model and the answer card rises.

const CARDS = [
  { t: 'Write a poem for Mum’s 60th', x: -38, y: -30, z: 0.9, m: 'gemini-2.5-flash' },
  { t: 'Fix: cannot read “map” of undefined', x: 34, y: -34, z: 1.2, m: 'gpt-5.4' },
  { t: 'Logo concept — violet fox', x: -44, y: 18, z: 0.7, m: 'flux-2-klein' },
  { t: 'Landing page for my bakery', x: 40, y: 22, z: 1, m: 'claude-sonnet-4.6' },
  { t: 'What changed in churn this quarter?', x: -6, y: -44, z: 0.8, m: 'gemini-3.1-pro' },
]
const PILLS = ['gemini-2.5-flash', 'gpt-5.4', 'claude-sonnet-4.6', 'gemini-3.1-pro', 'flux-2-klein']
const STEPS = [
  ['01', 'You ask', 'Type anything — code, words, numbers, images. No model picker.'],
  ['02', 'Kwoat reads & routes', 'It weighs the task and its difficulty, then picks the best model for the price.'],
  ['03', 'You get the answer', 'Streamed back with the model named and the cost shown — down to the credit.'],
]

export function How() {
  const root = useRef<HTMLElement>(null)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const mm = gsap.matchMedia()
    const ctx = gsap.context(() => {
      const build = (pin: boolean) => {
        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: {
            trigger: pin ? root.current : '.how-stage',
            start: pin ? 'top top' : 'top 75%',
            end: pin ? '+=2600' : 'bottom 30%',
            pin,
            scrub: 1,
            onUpdate: (s) => setStep(s.progress < 0.36 ? 0 : s.progress < 0.68 ? 1 : 2),
          },
        })
        // 1. cards float in from the edges at their own depth
        tl.fromTo(
          '.how-card',
          { xPercent: (i) => CARDS[i].x * 4 * CARDS[i].z, yPercent: (i) => CARDS[i].y * 3 * CARDS[i].z, opacity: 0, scale: 0.8, rotate: (i) => (i % 2 ? 8 : -8) },
          { xPercent: (i) => CARDS[i].x * 2.2, yPercent: (i) => CARDS[i].y * 2.2, opacity: 1, scale: 1, rotate: (i) => (i % 2 ? 3 : -3), duration: 1, stagger: 0.05 },
        )
          .from('.how-core', { scale: 0.6, opacity: 0, duration: 0.8 }, 0.2)
          // 2. they're pulled into the mark
          .to('.how-card', { xPercent: 0, yPercent: 0, scale: 0.2, opacity: 0, rotate: 0, filter: 'blur(6px)', duration: 1, stagger: 0.06 }, '+=0.3')
          .to('.how-core', { scale: 1.12, duration: 0.5 }, '<0.5')
          .to('.how-ring', { scale: 2.6, opacity: 0, duration: 1, stagger: 0.15 }, '<')
          .to('.how-core', { scale: 1, duration: 0.4 })
          // 3. beam to the model, answer rises
          .from('.how-pill', { y: 30, opacity: 0, stagger: 0.06, duration: 0.6 }, '-=0.2')
          .fromTo('.how-beam', { scaleY: 0 }, { scaleY: 1, transformOrigin: 'top', duration: 0.6 })
          .to('.how-pill.is-pick', { scale: 1.08, duration: 0.3 })
          .from('.how-answer', { y: 40, opacity: 0, scale: 0.95, duration: 0.7 }, '-=0.1')
          .to({}, { duration: 0.4 })
      }
      mm.add('(min-width: 900px)', () => build(true))
      mm.add('(max-width: 899px)', () => build(false))
    }, root)
    return () => {
      ctx.revert()
      mm.revert()
    }
  }, [])

  useEffect(() => {
    ScrollTrigger.refresh()
  }, [])

  return (
    <section ref={root} className="how" id="how">
      <div className="container how-grid">
        <div className="how-copy">
          <span className="eyebrow">How it works</span>
          <h2 className="display h-sec">
            Many models.
            <br />
            <span className="grad-text">One answer.</span>
          </h2>
          <ol className="how-steps">
            {STEPS.map(([n, t, d], i) => (
              <li key={n} className={i === step ? 'is-on' : i < step ? 'is-done' : ''}>
                <span className="mono">{n}</span>
                <div>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="how-stage">
          {CARDS.map((c) => (
            <div key={c.t} className="how-card glass" style={{ ['--z' as string]: c.z }}>
              <span className="mono">Prompt</span>
              {c.t}
            </div>
          ))}
          <div className="how-core">
            <span className="how-ring" />
            <span className="how-ring" />
            <span className="how-ring" />
            <div className="how-mark">
              <Mark size={64} />
            </div>
          </div>
          <span className="how-beam" />
          <div className="how-pills">
            {PILLS.map((id) => {
              const m = MODELS.find((x) => x.id === id)!
              return (
                <span key={id} className={`how-pill ${id === 'claude-sonnet-4.6' ? 'is-pick' : ''}`}>
                  <i style={{ background: m.color }} />
                  {m.name}
                </span>
              )
            })}
          </div>
          <div className="how-answer glass">
            <div className="ha-top">
              <span className="ha-model">
                <Mark size={12} /> Claude Sonnet 4.6
              </span>
              <span className="ha-cost mono">6 cr</span>
            </div>
            <p>Here’s your bakery landing page — warm hero, menu grid, opening hours and an order button. Live preview is ready.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
