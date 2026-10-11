import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/motion'
import { Mark } from '../components/ui'
import { useInView } from '../lib/hooks'
import { api, modelById } from '../api'

const PROMPTS = [
  'Write a poem about Lagos at night',
  'Fix: cannot read “map” of undefined',
  'Logo concept — violet fox, minimal',
  'Landing page for my bakery',
  'What changed in churn this quarter?',
]
const NODES = ['gemini-2.5-flash', 'gpt-5.4', 'flux-2-klein', 'claude-sonnet-4.6', 'gemini-3.1-pro']
const STEPS = [
  { t: 'Read', d: 'Kwoat looks at what you’re asking — code, writing, analysis, an image — and how hard it is.' },
  { t: 'Route', d: 'It picks the model that answers that kind of prompt best, at the lowest cost that does the job.' },
  { t: 'Answer', d: 'The reply streams back with the model named and its price shown. No guessing, no switching tabs.' },
]
const PHASE_MS = [1700, 1300, 2200]

// Geometry (viewBox 640 × 560): prompt at top, mark in the middle, models below
const W = 640
const CX = W / 2
const MARK_Y = 250
const NODE_Y = 470
const nodeX = (i: number) => 64 + i * ((W - 128) / (NODES.length - 1))
const inPath = (k: number) => `M${CX + (k - 2) * 120},70 C${CX + (k - 2) * 90},150 ${CX + (k - 2) * 10},${MARK_Y - 70} ${CX},${MARK_Y - 34}`
const outPath = (i: number) => `M${CX},${MARK_Y + 34} C${CX},${MARK_Y + 120} ${nodeX(i)},${NODE_Y - 120} ${nodeX(i)},${NODE_Y - 22}`

export function Routing() {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.3 })
  const [phase, setPhase] = useState(0)
  const [n, setN] = useState(0)
  const svg = useRef<SVGSVGElement>(null)
  const prompt = PROMPTS[n % PROMPTS.length]
  const d = api.route(prompt)
  const active = NODES.indexOf(d.modelId)
  const model = modelById(d.modelId)

  useEffect(() => {
    if (!inView) return
    const t = setTimeout(() => {
      if (phase === 2) {
        setPhase(0)
        setN((x) => x + 1)
      } else setPhase(phase + 1)
    }, PHASE_MS[phase])
    return () => clearTimeout(t)
  }, [phase, inView])

  useEffect(() => {
    const s = svg.current
    if (!s) return
    const ctx = gsap.context(() => {
      if (phase === 0) {
        gsap.fromTo('.rt-in-live', { strokeDashoffset: 1 }, { strokeDashoffset: -1, duration: 1.4, ease: 'power2.inOut', stagger: 0.06 })
        gsap.fromTo('.rt-mark', { scale: 1 }, { scale: 1.08, duration: 0.4, delay: 1.1, yoyo: true, repeat: 1, transformOrigin: '50% 50%', ease: 'power2.out' })
      }
      if (phase === 1) {
        gsap.fromTo(`.rt-out-live[data-i="${active}"]`, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1, ease: 'power3.inOut' })
        gsap.fromTo('.rt-halo', { scale: 0.6, opacity: 0.8 }, { scale: 2.4, opacity: 0, duration: 1.2, ease: 'expo.out', transformOrigin: '50% 50%' })
      }
    }, s)
    return () => ctx.revert()
  }, [phase, active, n])

  return (
    <section className="routing" id="routing">
      <div className="container">
        <div className="sec-head">
          <span className="kicker">Auto routing</span>
          <h2 className="h-lg metal">
            Many models.
            <br />
            One right answer.
          </h2>
          <p className="lede">The Kwoat mark is the product: every frontier model, converging on the one that fits your prompt.</p>
        </div>

        <div ref={ref} className="rt-grid">
          <ol className="rt-steps">
            {STEPS.map((s, i) => (
              <li key={s.t} className={i === phase ? 'is-on' : i < phase ? 'is-done' : ''}>
                <span className="rt-num mono">0{i + 1}</span>
                <div>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
                <i className="rt-bar">
                  <b style={{ animationDuration: `${PHASE_MS[i]}ms`, animationPlayState: inView && i === phase ? 'running' : 'paused' }} key={`${n}-${phase}`} />
                </i>
              </li>
            ))}
          </ol>

          <div className="rt-stage panel">
            <div className={`rt-prompt ${phase === 0 ? 'is-in' : ''}`} key={n}>
              <span className="mono">Prompt</span>
              {prompt}
            </div>
            <svg ref={svg} viewBox={`0 0 ${W} 560`} className="rt-svg" aria-hidden>
              <defs>
                <linearGradient id="rtg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#c4b5fd" stopOpacity="0" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
                <radialGradient id="rtc">
                  <stop offset="0" stopColor="#8b5cf6" stopOpacity="0.5" />
                  <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
                </radialGradient>
              </defs>
              {[0, 1, 2, 3, 4].map((k) => (
                <path key={`a${k}`} d={inPath(k)} className="rt-in" />
              ))}
              {[0, 1, 2, 3, 4].map((k) => (
                <path key={`b${k}`} d={inPath(k)} className="rt-in-live" pathLength={1} />
              ))}
              {NODES.map((_, i) => (
                <path key={`c${i}`} d={outPath(i)} className="rt-out" />
              ))}
              {NODES.map((_, i) => (
                <path key={`d${i}`} d={outPath(i)} data-i={i} pathLength={1} className={`rt-out-live ${i === active && phase > 0 ? 'is-on' : ''}`} />
              ))}
              <circle cx={CX} cy={MARK_Y} r="120" fill="url(#rtc)" />
              <circle className="rt-halo" cx={CX} cy={MARK_Y} r="40" fill="none" stroke="#a78bfa" />
              <g className="rt-mark">
                <rect x={CX - 36} y={MARK_Y - 36} width="72" height="72" rx="20" className="rt-mark-bg" />
                <g transform={`translate(${CX - 22},${MARK_Y - 24}) scale(0.46)`}>
                  <path d="M 12 18 L 18 14 L 48 84 Z M 28 12 L 33 10 L 48 84 Z M 46 22 L 50 22 L 48 84 Z M 63 10 L 68 12 L 48 84 Z M 78 14 L 84 18 L 48 84 Z" fill="#f5f4f8" />
                </g>
              </g>
              {NODES.map((id, i) => {
                const m = modelById(id)!
                const on = i === active && phase > 0
                return (
                  <g key={id} transform={`translate(${nodeX(i)},${NODE_Y})`} className={`rt-node ${on ? 'is-on' : ''}`}>
                    <rect x="-56" y="-20" width="112" height="40" rx="20" />
                    <circle cx="-38" cy="0" r="4" fill={m.color} />
                    <text x="-28" y="4">
                      {m.name.replace('Claude ', '').replace('Gemini ', 'Gemini ')}
                    </text>
                  </g>
                )
              })}
            </svg>
            <div className={`rt-answer ${phase === 2 ? 'is-in' : ''}`}>
              <span className="rt-answer-model">
                <Mark size={12} /> {model?.name}
              </span>
              <span className="rt-answer-why">{d.reason}</span>
              <span className="rt-answer-cost mono">{model?.cost} cr</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
