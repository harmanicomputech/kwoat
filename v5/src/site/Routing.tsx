import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from '../lib/motion'
import { Icon, Mark, type IconName } from '../components/ui'
import { modelById } from '../api'

// Auto mode, drawn as a switchboard: a prompt flows into Kwoat, and a beam
// carries it out to the model that is best at that kind of task.
const PROMPTS: { icon: IconName; label: string; text: string; model: string }[] = [
  { icon: 'code', label: 'Code', text: 'Why does my loop crash?', model: 'gpt-5.4' },
  { icon: 'globe', label: 'Website', text: 'Build a landing page for my café', model: 'claude-sonnet-4.6' },
  { icon: 'image', label: 'Image', text: 'A neon fox in rainy Tokyo', model: 'flux-2-klein' },
  { icon: 'analyse', label: 'Analysis', text: 'Compare Q2 vs Q3 revenue', model: 'gemini-3.1-pro' },
  { icon: 'bolt', label: 'News', text: 'What happened in AI today?', model: 'grok-4.20' },
  { icon: 'pencil', label: 'Writing', text: 'A poem for mum’s birthday', model: 'gemini-2.5-flash' },
]
const MODEL_ORDER = ['claude-sonnet-4.6', 'gemini-2.5-flash', 'gpt-5.4', 'grok-4.20', 'flux-2-klein', 'gemini-3.1-pro']
const WHY: Record<string, string> = {
  'gpt-5.4': 'Code task → best debugging model',
  'claude-sonnet-4.6': 'Web build → strongest at code + live preview',
  'flux-2-klein': 'Image request → fast diffusion model',
  'gemini-3.1-pro': 'Analysis → long-context reasoning',
  'grok-4.20': 'Current events → live web model',
  'gemini-2.5-flash': 'Creative writing → quick and low cost',
}

export function Routing() {
  const board = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [auto, setAuto] = useState(true)
  const [paths, setPaths] = useState<{ ins: string[]; outs: Record<string, string>; w: number; h: number }>({ ins: [], outs: {}, w: 0, h: 0 })
  const dot = useRef<SVGCircleElement>(null)
  const inView = useRef(false)

  // Measure the nodes and draw a curve from each prompt to the hub and from the hub to each model
  useLayoutEffect(() => {
    const el = board.current
    if (!el) return
    const measure = () => {
      const b = el.getBoundingClientRect()
      const vertical = b.width < 760
      const hub = el.querySelector('.rt5-hub-core')!.getBoundingClientRect()
      const hc = { x: hub.left - b.left + hub.width / 2, y: hub.top - b.top + hub.height / 2 }
      const curve = (a: { x: number; y: number }, c: { x: number; y: number }) => {
        if (vertical) {
          const my = (a.y + c.y) / 2
          return `M${a.x},${a.y} C${a.x},${my} ${c.x},${my} ${c.x},${c.y}`
        }
        const mx = (a.x + c.x) / 2
        return `M${a.x},${a.y} C${mx},${a.y} ${mx},${c.y} ${c.x},${c.y}`
      }
      const ins = [...el.querySelectorAll<HTMLElement>('.rt5-prompt')].map((p) => {
        const r = p.getBoundingClientRect()
        const a = vertical ? { x: r.left - b.left + r.width / 2, y: r.bottom - b.top } : { x: r.right - b.left, y: r.top - b.top + r.height / 2 }
        return curve(a, { x: hc.x, y: vertical ? hc.y - hub.height / 2 : hc.y })
      })
      const outs: Record<string, string> = {}
      el.querySelectorAll<HTMLElement>('.rt5-model').forEach((m) => {
        const r = m.getBoundingClientRect()
        const c = vertical ? { x: r.left - b.left + r.width / 2, y: r.top - b.top } : { x: r.left - b.left, y: r.top - b.top + r.height / 2 }
        outs[m.dataset.id!] = curve({ x: hc.x, y: vertical ? hc.y + hub.height / 2 : hc.y }, c)
      })
      setPaths({ ins, outs, w: b.width, h: b.height })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Cycle through prompts while on screen, until the visitor picks one
  useEffect(() => {
    const el = board.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => (inView.current = e.isIntersecting), { threshold: 0.3 })
    io.observe(el)
    const t = setInterval(() => auto && inView.current && setActive((a) => (a + 1) % PROMPTS.length), 3400)
    return () => {
      io.disconnect()
      clearInterval(t)
    }
  }, [auto])

  // Send a spark along the active route
  useEffect(() => {
    const p = PROMPTS[active]
    const inPath = paths.ins[active]
    const outPath = paths.outs[p.model]
    if (!inPath || !outPath || !dot.current) return
    const tl = gsap.timeline()
    tl.set(dot.current, { opacity: 1 })
      .to(dot.current, { duration: 0.8, ease: 'power2.inOut', motionPath: { path: inPath } })
      .fromTo('.rt5-hub-core', { scale: 1 }, { scale: 1.12, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' })
      .to(dot.current, { duration: 0.8, ease: 'power2.inOut', motionPath: { path: outPath } })
      .fromTo(`.rt5-model[data-id="${p.model}"]`, { scale: 1 }, { scale: 1.06, duration: 0.2, yoyo: true, repeat: 1 })
      .to(dot.current, { opacity: 0, duration: 0.3 })
    return () => {
      tl.kill()
    }
  }, [active, paths])

  const p = PROMPTS[active]
  const m = modelById(p.model)!
  return (
    <section className="rt5 sec5" id="auto">
      <div className="container">
        <div className="sec5-head">
          <span className="kick5" data-reveal>
            <Icon name="sparkle" size={14} /> Auto mode
          </span>
          <h2 data-split>Stop choosing. Start doing.</h2>
          <p data-reveal>Every model is great at something. Kwoat reads each prompt and sends it to the one that does that job best — at the lowest cost that does it well.</p>
        </div>

        <div ref={board} className="rt5-board" data-reveal>
          <svg className="rt5-svg" width={paths.w} height={paths.h} aria-hidden>
            <defs>
              <linearGradient id="rt5g" x1="0" x2="1">
                <stop offset="0" stopColor="#8b5cf6" />
                <stop offset="0.6" stopColor="#ec4899" />
                <stop offset="1" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            {paths.ins.map((d, i) => (
              <path key={'i' + i} d={d} className={`rt5-line ${i === active ? 'on' : ''}`} />
            ))}
            {Object.entries(paths.outs).map(([id, d]) => (
              <path key={id} d={d} className={`rt5-line ${id === p.model ? 'on' : ''}`} />
            ))}
            <circle ref={dot} r="5" className="rt5-spark" style={{ opacity: 0 }} />
          </svg>

          <div className="rt5-col">
            <small className="rt5-col-label">Your prompt</small>
            {PROMPTS.map((q, i) => (
              <button
                key={q.label}
                className={`rt5-prompt ${i === active ? 'on' : ''}`}
                onClick={() => {
                  setAuto(false)
                  setActive(i)
                }}
              >
                <span className="rt5-prompt-ico">
                  <Icon name={q.icon} size={15} />
                </span>
                <span>
                  <b>{q.label}</b>
                  <small>{q.text}</small>
                </span>
              </button>
            ))}
          </div>

          <div className="rt5-hub">
            <div className="rt5-hub-core">
              <span className="rt5-ring" />
              <span className="rt5-ring r2" />
              <span className="rt5-ring r3" />
              <Mark size={34} />
            </div>
            <b>Kwoat Auto</b>
            <div key={active} className="rt5-why">
              {WHY[p.model]}
            </div>
          </div>

          <div className="rt5-col">
            <small className="rt5-col-label">Best model</small>
            {MODEL_ORDER.map((id) => {
              const mm = modelById(id)!
              return (
                <div key={id} data-id={id} className={`rt5-model ${id === p.model ? 'on' : ''}`} style={{ ['--c' as string]: mm.color }}>
                  <span className="rt5-model-ico">{mm.vendor[0]}</span>
                  <span>
                    <b>{mm.name}</b>
                    <small>{mm.vendor}</small>
                  </span>
                  <em>~{mm.cost} cr</em>
                </div>
              )
            })}
          </div>
        </div>
        <p className="rt5-foot" data-reveal>
          Picked <b style={{ color: m.color }}>{m.name}</b> for “{p.text}” · or choose any model yourself, any time.
        </p>
      </div>
    </section>
  )
}
