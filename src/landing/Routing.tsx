import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../lib/motion'
import { api, modelById } from '../api'

const STEPS = [
  'Write a poem about Lagos at night',
  'Debug: TypeError: cannot read “map” of undefined',
  'Generate a logo — violet fox, minimal',
  'Build a landing page for my bakery',
  'Analyse churn in this sales export',
]

// Nodes the router can pick, laid out on the right of the diagram.
const NODES = ['gemini-2.5-flash', 'gpt-5.4', 'flux-2-klein', 'claude-sonnet-4.6', 'gemini-3.1-pro', 'grok-4.20']
const W = 1000
const H = 560
const CORE = { x: 470, y: H / 2 }
const nodeY = (i: number) => 60 + i * ((H - 120) / (NODES.length - 1))
const path = (i: number) => {
  const y = nodeY(i)
  return `M${CORE.x + 50},${CORE.y} C${CORE.x + 220},${CORE.y} ${760 - 160},${y} 760,${y}`
}

export function Routing() {
  const root = useRef<HTMLElement>(null)
  const [step, setStep] = useState(0)
  const promptRef = useRef<HTMLParagraphElement>(null)
  const decision = api.route(STEPS[step])
  const active = NODES.indexOf(decision.modelId)
  const model = modelById(decision.modelId)

  useEffect(() => {
    const mm = gsap.matchMedia()
    const ctx = gsap.context(() => {
      mm.add('(min-width: 900px)', () => {
        ScrollTrigger.create({
          trigger: root.current,
          start: 'top top',
          end: `+=${STEPS.length * 70}%`,
          pin: true,
          scrub: true,
          snap: { snapTo: 1 / (STEPS.length - 1), duration: 0.5, ease: 'power2.inOut' },
          onUpdate: (s) => setStep(Math.min(STEPS.length - 1, Math.round(s.progress * (STEPS.length - 1)))),
        })
      })
      mm.add('(max-width: 899px)', () => {
        const id = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 2600)
        return () => clearInterval(id)
      })
      gsap.from('.rt-head > *', {
        y: 40,
        opacity: 0,
        stagger: 0.1,
        duration: 1,
        ease: 'kwoat',
        scrollTrigger: { trigger: root.current, start: 'top 75%' },
      })
    }, root)
    return () => {
      ctx.revert()
      mm.revert()
    }
  }, [])

  // Scramble the prompt each time the step changes, then fire a pulse down the chosen wire
  useEffect(() => {
    if (!promptRef.current) return
    gsap.to(promptRef.current, {
      duration: 0.9,
      scrambleText: { text: STEPS[step], chars: '01#%&*KWOAT', speed: 0.6 },
      ease: 'none',
    })
    const wire = root.current?.querySelector<SVGPathElement>(`.rt-wire[data-i="${active}"]`)
    const pulse = root.current?.querySelector<SVGCircleElement>('.rt-pulse')
    if (wire && pulse) {
      const len = wire.getTotalLength()
      const o = { t: 0 }
      gsap.fromTo(
        o,
        { t: 0 },
        {
          t: 1,
          duration: 0.9,
          ease: 'power2.inOut',
          onUpdate: () => {
            const p = wire.getPointAtLength(o.t * len)
            pulse.setAttribute('cx', String(p.x))
            pulse.setAttribute('cy', String(p.y))
          },
        },
      )
      gsap.fromTo(wire, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.9, ease: 'power2.inOut' })
    }
    gsap.fromTo('.rt-core-ring', { scale: 0.6, opacity: 0.9 }, { scale: 2.2, opacity: 0, duration: 1.1, ease: 'expo.out' })
  }, [step, active])

  return (
    <section ref={root} className="routing" id="routing">
      <div className="container">
        <div className="rt-head">
          <span className="eyebrow">Auto routing</span>
          <h2 className="h2">
            The right model, <em className="serif grad-text">every time.</em>
          </h2>
          <p className="lede">Kwoat reads your prompt and picks the best model in milliseconds. You just ask.</p>
        </div>

        <div className="rt-stage">
          <div className="rt-prompt card spotlight">
            <span className="rt-label">Your prompt</span>
            <p ref={promptRef} className="rt-text">
              {STEPS[0]}
            </p>
            <div className="rt-steps">
              {STEPS.map((_, i) => (
                <i key={i} className={i === step ? 'is-active' : i < step ? 'is-done' : ''} />
              ))}
            </div>
          </div>

          <svg className="rt-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" aria-hidden>
            <defs>
              <linearGradient id="wireGrad" x1="0" x2="1">
                <stop offset="0" stopColor="#8b5cf6" />
                <stop offset="1" stopColor="#e879f9" />
              </linearGradient>
              <radialGradient id="coreGrad">
                <stop offset="0" stopColor="#c4b5fd" />
                <stop offset="1" stopColor="#6d28d9" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="6" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path d={`M240,${CORE.y} L${CORE.x - 50},${CORE.y}`} className="rt-in" />
            {NODES.map((_, i) => (
              <path key={`b${i}`} d={path(i)} className="rt-wire-bg" />
            ))}
            {NODES.map((_, i) => (
              <path key={`w${i}`} d={path(i)} data-i={i} className={`rt-wire ${i === active ? 'is-active' : ''}`} />
            ))}
            <circle className="rt-pulse" r="6" fill="#fff" filter="url(#glow)" cx={CORE.x} cy={CORE.y} />
            <g transform={`translate(${CORE.x},${CORE.y})`}>
              <circle className="rt-core-ring" r="50" fill="none" stroke="#a78bfa" strokeWidth="2" />
              <circle r="50" fill="url(#coreGrad)" filter="url(#glow)" />
              <text textAnchor="middle" dy="6" className="rt-core-text">
                Kwoat
              </text>
            </g>
            {NODES.map((id, i) => {
              const m = modelById(id)!
              const on = i === active
              return (
                <g key={id} transform={`translate(770,${nodeY(i)})`} className={`rt-node ${on ? 'is-active' : ''}`}>
                  <rect x="0" y="-22" width="210" height="44" rx="22" />
                  <circle cx="24" cy="0" r="6" fill={m.color} />
                  <text x="40" y="5">
                    {m.name}
                  </text>
                </g>
              )
            })}
          </svg>

          <div className="rt-result card">
            <span className="rt-label">Routed to</span>
            <strong key={model?.id} className="rt-model">
              <span className="dot" style={{ background: model?.color }} /> {model?.name}
            </strong>
            <p className="rt-reason">{decision.reason}</p>
            <div className="rt-meter">
              <span>Confidence</span>
              <b style={{ width: `${decision.confidence * 100}%` }} />
              <em>{Math.round(decision.confidence * 100)}%</em>
            </div>
            <div className="rt-cost">
              ~{model?.cost} credit{model?.cost === 1 ? '' : 's'}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
