import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/motion'
import { SplitFlap } from '../components/SplitFlap'
import { api, modelById } from '../api'

// The "K-1 Prompt Router": the product shown as a piece of hardware.
// Turn the dial (drag, scroll-wheel, arrow keys or click a label) to change mode;
// the LCD types a prompt, the LED bank scans and lands on the routed model.

const MODES = [
  { key: 'AUTO', prompts: ['Plan a 3-day trip to Zanzibar', 'Build a landing page for my bakery', 'Why does my useEffect run twice?'] },
  { key: 'WRITE', prompts: ['Write a poem about Lagos at night', 'Draft a warm follow-up email'] },
  { key: 'CODE', prompts: ['Debug: cannot read map of undefined', 'Write a SQL query for churn by month'] },
  { key: 'ANALYSE', prompts: ['Analyse this quarter’s revenue data', 'Compare our pricing to 3 rivals'] },
  { key: 'IMAGE', prompts: ['Draw a neon fox in a rainy alley', 'Logo: minimal dial, orange needle'] },
  { key: 'MISSION', prompts: ['Ship a REST API with JWT auth', 'Research deck: African fintech 2026'] },
  { key: 'COMPARE', prompts: ['Explain quantum computing simply'] },
] as const

const BANK = ['gemini-2.5-flash', 'gpt-5.4', 'claude-sonnet-4.6', 'gemini-3.1-pro', 'grok-4.20', 'flux-2-klein', 'claude-opus-4.7']
const SWEEP = 270
const STEP = SWEEP / (MODES.length - 1)
const angleFor = (i: number) => -SWEEP / 2 + i * STEP

function routeFor(mode: string, prompt: string): string[] {
  if (mode === 'COMPARE') return ['gpt-5.4', 'claude-sonnet-4.6', 'gemini-3.1-pro', 'grok-4.20']
  if (mode === 'MISSION') return ['claude-opus-4.7']
  return [api.route(prompt).modelId]
}

export function Device() {
  const [mode, setMode] = useState(0)
  const [typed, setTyped] = useState('')
  const [lit, setLit] = useState<string[]>([])
  const [scan, setScan] = useState<number | null>(null)
  const [phase, setPhase] = useState<'type' | 'route' | 'done'>('type')
  const knob = useRef<HTMLDivElement>(null)
  const root = useRef<HTMLDivElement>(null)
  const key = useRef<HTMLButtonElement>(null)
  const cycle = useRef(0)
  const runId = useRef(0)

  const m = MODES[mode]
  const prompt = m.prompts[cycle.current % m.prompts.length]
  const routed = lit.length === 1 ? modelById(lit[0]) : null

  // Rotate the knob to the current detent
  useEffect(() => {
    gsap.to(knob.current, { rotate: angleFor(mode), duration: 0.7, ease: 'elastic.out(1, 0.55)' })
  }, [mode])

  const run = useCallback(async () => {
    const id = ++runId.current
    const alive = () => id === runId.current
    const md = MODES[mode]
    const text = md.prompts[cycle.current % md.prompts.length]
    setLit([])
    setPhase('type')
    setTyped('')
    for (let i = 1; i <= text.length; i++) {
      await sleep(28 + Math.random() * 35)
      if (!alive()) return
      setTyped(text.slice(0, i))
    }
    await sleep(250)
    if (!alive()) return
    setPhase('route')
    // LED sweep
    for (let s = 0; s < BANK.length * 2; s++) {
      setScan(s % BANK.length)
      await sleep(45)
      if (!alive()) return
    }
    setScan(null)
    setLit(routeFor(md.key, text))
    setPhase('done')
    await sleep(3200)
    if (!alive()) return
    cycle.current++
    run()
  }, [mode])

  useEffect(() => {
    run()
    return () => {
      runId.current++
    }
  }, [run])

  // Dial interaction
  useEffect(() => {
    const el = knob.current!
    let dragging = false
    const pick = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const a = (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI + 90
      const norm = ((a + 540) % 360) - 180
      const clamped = Math.max(-SWEEP / 2, Math.min(SWEEP / 2, norm))
      const i = Math.round((clamped + SWEEP / 2) / STEP)
      setMode((cur) => (cur === i ? cur : (cycle.current = 0, i)))
    }
    const down = (e: PointerEvent) => {
      dragging = true
      el.setPointerCapture(e.pointerId)
      pick(e)
    }
    const move = (e: PointerEvent) => dragging && pick(e)
    const up = () => (dragging = false)
    const wheel = (e: WheelEvent) => {
      e.preventDefault()
      cycle.current = 0
      setMode((i) => Math.max(0, Math.min(MODES.length - 1, i + (e.deltaY > 0 ? 1 : -1))))
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('wheel', wheel, { passive: false })
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('wheel', wheel)
    }
  }, [])

  const press = () => {
    gsap.fromTo(key.current, { y: 0 }, { y: 4, duration: 0.08, yoyo: true, repeat: 1 })
    cycle.current++
    run()
  }

  return (
    <div ref={root} className="k1" role="group" aria-label="Interactive demo: the Kwoat prompt router">
      <span className="k1-screw tl" />
      <span className="k1-screw tr" />
      <span className="k1-screw bl" />
      <span className="k1-screw br" />

      <div className="k1-top">
        <span className="label">
          <b>K-1</b> Prompt router
        </span>
        <span className="label k1-power">
          <span className="led ok" /> On
        </span>
      </div>

      <div className="k1-lcd">
        <div className="k1-lcd-row">
          <span>MODE</span>
          <SplitFlap value={m.key} length={7} className="flap-lcd" />
          <span className="k1-lcd-gap" />
          <span>{phase === 'done' ? 'ROUTED' : phase === 'route' ? 'ROUTING' : 'INPUT'}</span>
        </div>
        <div className="k1-lcd-prompt">
          <span className="k1-caret">›</span> {typed}
          {phase === 'type' && <span className="k1-cursor" />}
        </div>
        <div className="k1-lcd-row k1-lcd-out">
          <span>→</span>
          <SplitFlap
            value={phase === 'done' ? (lit.length > 1 ? `${lit.length} MODELS IN PARALLEL` : (routed?.name ?? '')) : phase === 'route' ? '· · ·' : ''}
            length={22}
            className="flap-lcd"
            speed={22}
            stagger={1}
          />
          <span className="k1-lcd-gap" />
          <span className="k1-cost">{phase === 'done' ? `${lit.reduce((n, id) => n + (modelById(id)?.cost ?? 0), 0)} CR` : '-- CR'}</span>
        </div>
        <div className="k1-meter" aria-hidden>
          {Array.from({ length: 28 }).map((_, i) => (
            <i key={i} style={{ animationDelay: `${(i * 37) % 600}ms` }} className={phase === 'route' ? 'is-hot' : phase === 'done' ? 'is-on' : ''} />
          ))}
        </div>
      </div>

      <div className="k1-body">
        <div className="k1-dial-wrap">
          {MODES.map((md, i) => {
            const a = (angleFor(i) - 90) * (Math.PI / 180)
            return (
              <button
                key={md.key}
                className={`k1-dial-label ${i === mode ? 'is-on' : ''}`}
                style={{ left: `${50 + Math.cos(a) * 49}%`, top: `${50 + Math.sin(a) * 49}%` }}
                onClick={() => {
                  cycle.current = 0
                  setMode(i)
                }}
              >
                {md.key}
              </button>
            )
          })}
          <div className="k1-ticks" aria-hidden>
            {Array.from({ length: 37 }).map((_, i) => (
              <i key={i} style={{ transform: `rotate(${-SWEEP / 2 + (i * SWEEP) / 36 + 180}deg) translateY(calc(50cqw + 4px))` }} className={i % 6 === 0 ? 'major' : ''} />
            ))}
          </div>
          <div
            ref={knob}
            className="k1-knob"
            role="slider"
            tabIndex={0}
            aria-label="Mode"
            aria-valuemin={0}
            aria-valuemax={MODES.length - 1}
            aria-valuenow={mode}
            aria-valuetext={m.key}
            data-cursor="Turn"
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowUp') setMode((i) => Math.min(MODES.length - 1, i + 1))
              if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') setMode((i) => Math.max(0, i - 1))
            }}
          >
            <span className="k1-knob-dot" />
            <span className="k1-knob-grip" />
          </div>
        </div>

        <div className="k1-bank">
          <span className="label">Model bank</span>
          <ul>
            {BANK.map((id, i) => {
              const md = modelById(id)!
              const on = lit.includes(id)
              return (
                <li key={id} className={`${on ? 'is-on' : ''} ${scan === i ? 'is-scan' : ''}`}>
                  <span className="k1-led" />
                  <span className="k1-model">{md.name}</span>
                  <span className="k1-tier">{md.tier.slice(0, 3)}</span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <div className="k1-foot">
        <div className="k1-switches" aria-hidden>
          <span className="k1-switch is-on" />
          <span className="k1-switch" />
          <span className="label">Web · Voice</span>
        </div>
        <span className="label k1-serial">SN 0001-KW · {prompt.length.toString().padStart(3, '0')}</span>
        <button ref={key} className="k1-key" onClick={press} data-cursor="Send">
          Send
        </button>
      </div>
    </div>
  )
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
