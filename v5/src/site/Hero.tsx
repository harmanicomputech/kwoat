import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gsap, SplitText, isTouch, prefersReducedMotion } from '../lib/motion'
import { Icon, Magnetic, Mark } from '../components/ui'
import { modelById } from '../api'

// Hero: copy on the left, an orbit of AI models on the right. Every few
// seconds a new task rolls into the headline and a beam lights up the model
// Kwoat would send it to.
const TASKS = [
  { word: 'coding', model: 'gpt-5.4' },
  { word: 'websites', model: 'claude-sonnet-4.6' },
  { word: 'images', model: 'flux-2-klein' },
  { word: 'research', model: 'gemini-3.1-pro' },
  { word: 'the news', model: 'grok-4.20' },
  { word: 'writing', model: 'gemini-2.5-flash' },
  { word: 'deep thinking', model: 'claude-opus-4.7' },
  { word: 'video', model: 'kling-2.6-pro' },
]
// Inner ring, then outer ring
const RINGS = [
  ['gpt-5.4', 'claude-sonnet-4.6', 'gemini-3.1-pro', 'flux-2-klein'],
  ['grok-4.20', 'gemini-2.5-flash', 'claude-opus-4.7', 'llama-3.3-70b', 'kling-2.6-pro', 'mistral-small-4', 'nano-banana-2', 'gpt-4o-mini'],
]
const PLANETS = RINGS.flatMap((ids, r) => ids.map((id, i) => ({ id, r, a0: (i / ids.length) * Math.PI * 2 + r * 0.4 })))

export function Hero() {
  const root = useRef<HTMLElement>(null)
  const [task, setTask] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTask((i) => (i + 1) % TASKS.length), 2600)
    return () => clearInterval(t)
  }, [])

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const splits: SplitText[] = []
    const ctx = gsap.context(() => {
      const h = new SplitText('.hx-title .ln', { type: 'words', mask: 'words', wordsClass: 'w' })
      splits.push(h)
      const tl = gsap.timeline({ defaults: { ease: 'kwoat' }, delay: 0.1 })
      tl.fromTo('.hx-pill', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 })
        .from(h.words, { yPercent: 115, duration: 1.1, stagger: 0.08 }, 0.1)
        .fromTo('.hx-route, .hx-sub, .hx-ask, .hx-trust', { y: 22, opacity: 0, filter: 'blur(6px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1, stagger: 0.09, clearProps: 'filter' }, 0.5)
        .fromTo('.hx-orbit', { scale: 0.7, opacity: 0, rotate: -12 }, { scale: 1, opacity: 1, rotate: 0, duration: 1.8 }, 0.2)
      gsap.to('.hx-orbit-wrap', { yPercent: 14, scale: 0.92, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true } })
      gsap.to('.hx-copy', { yPercent: -10, opacity: 0.25, ease: 'none', scrollTrigger: { trigger: root.current, start: '30% top', end: 'bottom top', scrub: true } })
    }, root)
    return () => {
      ctx.revert()
      splits.forEach((s) => s.revert())
    }
  }, [])

  const t = TASKS[task]
  const m = modelById(t.model)!
  return (
    <section ref={root} className="hx" id="top">
      <div className="hx-bg" aria-hidden>
        <i className="b1" />
        <i className="b2" />
        <i className="b3" />
        <span className="hx-dots" />
        <span className="hx-horizon" />
      </div>
      <div className="container hx-grid">
        <div className="hx-copy">
          <Link to="/signup" className="hx-pill">
            <span className="hx-pill-new">New</span>
            Missions: AI that does the work
            <Icon name="send" size={13} />
          </Link>
          <h1 className="hx-title">
            <span className="ln">Every AI model.</span>
            <span className="ln grad-text">One platform.</span>
          </h1>
          <div className="hx-route" aria-live="polite">
            <span>Best for</span>
            <span className="hx-roll">
              <RollWord key={t.word} text={t.word} />
            </span>
            <Icon name="send" size={14} />
            <span key={m.id} className="hx-chip" style={{ ['--c' as string]: m.color }}>
              <i />
              {m.name}
            </span>
          </div>
          <p className="hx-sub">Stop choosing. Start doing. Kwoat sends every prompt to the model that does it best — and you only pay for what you use.</p>
          <AskBar />
          <div className="hx-trust">
            <span className="hx-stack">
              {['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'].map((c, i) => (
                <i key={c} style={{ background: c, zIndex: 5 - i }}>
                  {'OAGXK'[i]}
                </i>
              ))}
            </span>
            <span>
              <b>13+ models</b> · 50 free credits daily · no card needed
            </span>
          </div>
        </div>
        <div className="hx-orbit-wrap">
          <Orbit active={t.model} />
        </div>
      </div>
    </section>
  )
}

function RollWord({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    if (!ref.current || prefersReducedMotion()) return
    const chars = ref.current.querySelectorAll('i')
    gsap.fromTo(chars, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.025, duration: 0.6, ease: 'kwoat' })
  }, [])
  return (
    <span ref={ref} className="hx-word">
      {[...text].map((c, i) => (
        <i key={i}>{c === ' ' ? ' ' : c}</i>
      ))}
    </span>
  )
}

/** Prompt bar: typing here starts a real chat in the app. */
function AskBar() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  return (
    <form
      className="hx-ask"
      onSubmit={(e) => {
        e.preventDefault()
        navigate(q.trim() ? `/app?prompt=${encodeURIComponent(q.trim())}` : '/signup')
      }}
    >
      <span className="hx-ask-ring" aria-hidden />
      <Icon name="sparkle" size={18} />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask anything — Kwoat picks the model" aria-label="Ask Kwoat" />
      <Magnetic type="submit" className="btn btn-primary hx-ask-btn">
        Start free <Icon name="send" size={15} />
      </Magnetic>
    </form>
  )
}

/** 2.5D orbit: planets move on tilted ellipses, sized and layered by depth, tilting with the pointer. */
function Orbit({ active }: { active: string }) {
  const box = useRef<HTMLDivElement>(null)
  const beam = useRef<SVGPathElement>(null)
  const rings = useRef<(SVGEllipseElement | null)[]>([])
  const activeRef = useRef(active)
  activeRef.current = active

  useEffect(() => {
    const el = box.current
    if (!el) return
    const planets = [...el.querySelectorAll<HTMLElement>('.hx-planet')]
    const tilt = { x: 0, y: 0 }
    const tx = gsap.quickTo(tilt, 'x', { duration: 1.2, ease: 'power3' })
    const ty = gsap.quickTo(tilt, 'y', { duration: 1.2, ease: 'power3' })
    const move = (e: PointerEvent) => {
      tx((e.clientX / innerWidth - 0.5) * 2)
      ty((e.clientY / innerHeight - 0.5) * 2)
    }
    if (!isTouch()) window.addEventListener('pointermove', move)
    const reduced = prefersReducedMotion()
    let t = 0
    const tick = (_: number, dt: number) => {
      if (!reduced) t += dt / 1000
      const w = el.clientWidth
      const h = el.clientHeight
      const cx = w / 2 + tilt.x * 10
      const cy = h / 2 + tilt.y * 8
      const flat = 0.56 + tilt.y * 0.08
      const radii = [w * 0.29, w * 0.47]
      radii.forEach((rx, i) => {
        const e = rings.current[i]
        if (e) {
          e.setAttribute('cx', String(cx))
          e.setAttribute('cy', String(cy))
          e.setAttribute('rx', String(rx))
          e.setAttribute('ry', String(rx * flat))
        }
      })
      let ax = cx
      let ay = cy
      planets.forEach((p, k) => {
        const pl = PLANETS[k]
        const a = pl.a0 + t * (pl.r === 0 ? 0.22 : -0.12) + tilt.x * 0.25
        const rx = radii[pl.r]
        const x = cx + Math.cos(a) * rx
        const y = cy + Math.sin(a) * rx * flat
        const depth = (Math.sin(a) + 1) / 2 // 0 back … 1 front
        const s = 0.72 + depth * 0.4
        p.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${s})`
        p.style.zIndex = String(Math.round(depth * 100) + (depth > 0.5 ? 20 : 0))
        p.style.opacity = String(0.45 + depth * 0.55)
        if (pl.id === activeRef.current) {
          ax = x
          ay = y
        }
      })
      if (beam.current) {
        const mx = (cx + ax) / 2
        const my = Math.min(cy, ay) - 40
        beam.current.setAttribute('d', `M${cx},${cy} Q${mx},${my} ${ax},${ay}`)
      }
    }
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      window.removeEventListener('pointermove', move)
    }
  }, [])

  return (
    <div ref={box} className="hx-orbit">
      <svg className="hx-rings" aria-hidden>
        <defs>
          <linearGradient id="hxbeam" x1="0" x2="1">
            <stop offset="0" stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <ellipse ref={(e) => void (rings.current[0] = e)} className="hx-ring" />
        <ellipse ref={(e) => void (rings.current[1] = e)} className="hx-ring outer" />
        <path ref={beam} className="hx-beam" />
      </svg>
      <div className="hx-core">
        <span className="hx-core-glow" />
        <span className="hx-core-ring" />
        <span className="hx-core-ring r2" />
        <Mark size={44} color="#fff" />
      </div>
      {PLANETS.map((p) => {
        const m = modelById(p.id)!
        return (
          <span key={p.id} className={`hx-planet ${p.id === active ? 'on' : ''} ${p.r ? 'small' : ''}`} style={{ ['--c' as string]: m.color }}>
            <b>{m.vendor[0]}</b>
            <span>{m.name}</span>
          </span>
        )
      })}
    </div>
  )
}
