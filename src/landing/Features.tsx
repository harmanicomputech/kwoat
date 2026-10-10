import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap, ScrollTrigger } from '../lib/motion'
import { Arrow, Icon, type IconName } from '../components/ui'
import { useInView } from '../lib/hooks'

interface Feature {
  key: string
  icon: IconName
  kicker: string
  title: string
  body: string
  demo: () => React.ReactElement
  to: string
}

const FEATURES: Feature[] = [
  {
    key: 'compare',
    icon: 'compare',
    kicker: 'Compare mode',
    title: 'Same prompt. Four models. You pick.',
    body: 'Run any prompt across Claude, GPT, Gemini and Grok at once. See who answers best — and what each one costs.',
    demo: CompareDemo,
    to: '/app/compare',
  },
  {
    key: 'image',
    icon: 'image',
    kicker: 'Image generation',
    title: 'Generate, vary, and keep everything.',
    body: 'FLUX.2 Klein and Nano Banana 2 in one place. Every image lands in your Gallery automatically.',
    demo: ImageDemo,
    to: '/app/gallery',
  },
  {
    key: 'voice',
    icon: 'mic',
    kicker: 'Voice live mode',
    title: 'Talk to AI like it’s a phone call.',
    body: 'Real-time, two-way voice with any model. Interrupt any time. The transcript is saved to your chat.',
    demo: VoiceDemo,
    to: '/app/voice',
  },
  {
    key: 'missions',
    icon: 'rocket',
    kicker: 'Agent missions',
    title: 'Your AI that actually does the work.',
    body: 'Give it a goal. It searches, writes code, runs it in a live sandbox, fixes bugs, and hands you finished files.',
    demo: MissionDemo,
    to: '/app/missions',
  },
  {
    key: 'usage',
    icon: 'chart',
    kicker: 'Usage analytics',
    title: 'See exactly what you spend, and where.',
    body: 'Every response shows its credit cost. Track by model, feature and day. No surprise bills — ever.',
    demo: UsageDemo,
    to: '/app/usage',
  },
]

export function Features() {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mm = gsap.matchMedia()
    const ctx = gsap.context(() => {
      mm.add('(min-width: 900px)', () => {
        const t = track.current!
        const distance = () => t.scrollWidth - window.innerWidth
        const tween = gsap.to(t, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (s) => gsap.set('.ft-progress i', { scaleX: s.progress }),
          },
        })
        // Inner parallax relative to the horizontal movement
        gsap.utils.toArray<HTMLElement>('.ft-panel').forEach((panel) => {
          gsap.fromTo(
            panel.querySelector('.ft-demo'),
            { xPercent: 12, rotate: 2 },
            {
              xPercent: -12,
              rotate: -2,
              ease: 'none',
              scrollTrigger: { trigger: panel, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
            },
          )
          gsap.from(panel.querySelectorAll('.ft-copy > *'), {
            y: 50,
            opacity: 0,
            stagger: 0.08,
            duration: 0.9,
            ease: 'kwoat',
            scrollTrigger: { trigger: panel, containerAnimation: tween, start: 'left 70%' },
          })
        })
      })
      gsap.from('.ft-intro > *', {
        y: 50,
        opacity: 0,
        stagger: 0.1,
        duration: 1,
        ease: 'kwoat',
        scrollTrigger: { trigger: root.current, start: 'top 70%' },
      })
    }, root)
    return () => {
      ctx.revert()
      mm.revert()
    }
  }, [])

  return (
    <section ref={root} className="features" id="features">
      <div ref={track} className="ft-track">
        <div className="ft-intro">
          <span className="eyebrow">Everything you need</span>
          <h2 className="h2 h2-xl">
            One platform.
            <br />
            <em className="serif grad-text">Every</em> AI capability.
          </h2>
          <p className="lede">Five superpowers, one wallet. Keep scrolling →</p>
        </div>
        {FEATURES.map((f, i) => (
          <article className="ft-panel" key={f.key}>
            <div className="ft-num">0{i + 1}</div>
            <div className="ft-copy">
              <span className="ft-kicker">
                <Icon name={f.icon} /> {f.kicker}
              </span>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
              <Link to={f.to} className="ft-link" data-cursor="hover">
                Try it free <Arrow />
              </Link>
            </div>
            <div className="ft-demo card">
              <f.demo />
            </div>
          </article>
        ))}
      </div>
      <div className="ft-progress" aria-hidden>
        <i />
      </div>
    </section>
  )
}

/* ---------------- Mini demos ---------------- */

const COMPARE = [
  { name: 'Claude Sonnet 4.6', color: '#fbbf24', cost: 6, speed: 1 },
  { name: 'GPT-5.4', color: '#34d399', cost: 6, speed: 1.3 },
  { name: 'Gemini 3.1 Pro', color: '#22d3ee', cost: 5, speed: 0.8 },
  { name: 'Grok 4.20', color: '#f472b6', cost: 2, speed: 1.6 },
]

function CompareDemo() {
  const [ref, inView] = useInView<HTMLDivElement>()
  useEffect(() => {
    if (!inView || !ref.current) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.cd-col').forEach((col, i) => {
        const lines = col.querySelectorAll('.cd-line')
        gsap.fromTo(
          lines,
          { scaleX: 0 },
          { scaleX: 1, transformOrigin: 'left', stagger: 0.25 / COMPARE[i].speed, duration: 0.5, ease: 'power2.out', repeat: -1, repeatDelay: 2 },
        )
      })
    }, ref)
    return () => ctx.revert()
  }, [inView, ref])
  return (
    <div ref={ref} className="cd">
      {COMPARE.map((m, i) => (
        <div className={`cd-col ${i === 0 ? 'is-winner' : ''}`} key={m.name}>
          <div className="cd-head">
            <span className="dot" style={{ background: m.color }} />
            {m.name}
          </div>
          {Array.from({ length: 6 }).map((_, k) => (
            <span key={k} className="cd-line" style={{ width: `${55 + ((k * 37 + i * 13) % 45)}%` }} />
          ))}
          <div className="cd-foot">
            <span>~{m.cost} cr</span>
            {i === 0 && <b>★ Best</b>}
          </div>
        </div>
      ))}
    </div>
  )
}

function ImageDemo() {
  const [ref, inView] = useInView<HTMLDivElement>()
  useEffect(() => {
    if (!inView || !ref.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.id-tile',
        { clipPath: 'inset(100% 0 0 0)', scale: 1.2 },
        { clipPath: 'inset(0% 0 0 0)', scale: 1, stagger: { each: 0.12, from: 'random' }, duration: 1.2, ease: 'expo.out' },
      )
    }, ref)
    return () => ctx.revert()
  }, [inView, ref])
  return (
    <div ref={ref} className="id">
      <div className="id-prompt">
        <Icon name="sparkle" size={14} /> “Neon fox in a rainy Tokyo alley, cinematic”
      </div>
      <div className="id-grid">
        {[265, 300, 320, 200].map((h, i) => (
          <div key={i} className="id-tile" style={{ ['--h' as string]: h }}>
            <div className="id-fox" />
          </div>
        ))}
      </div>
    </div>
  )
}

function VoiceDemo() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [ref, inView] = useInView<HTMLDivElement>()
  useEffect(() => {
    const c = canvas.current
    if (!c || !inView) return
    const ctx = c.getContext('2d')!
    let raf = 0
    const draw = (t: number) => {
      const w = (c.width = c.clientWidth * 2)
      const h = (c.height = c.clientHeight * 2)
      ctx.clearRect(0, 0, w, h)
      const bars = 48
      for (let i = 0; i < bars; i++) {
        const x = (i / bars) * w + w / bars / 2
        const talk = (Math.sin(t / 900) + 1) / 2
        const amp = (Math.sin(i * 0.5 + t / 140) * 0.5 + 0.5) * (Math.sin(i * 0.13 + t / 400) * 0.5 + 0.5) * (0.25 + talk * 0.75)
        const bh = 8 + amp * h * 0.75
        const g = ctx.createLinearGradient(0, h / 2 - bh / 2, 0, h / 2 + bh / 2)
        g.addColorStop(0, '#e879f9')
        g.addColorStop(1, '#8b5cf6')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.roundRect(x - 4, h / 2 - bh / 2, 8, bh, 4)
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [inView])
  return (
    <div ref={ref} className="vd">
      <div className="vd-orb">
        <span />
        <span />
        <span />
      </div>
      <canvas ref={canvas} className="vd-wave" />
      <div className="vd-transcript">
        <p>
          <b>You</b> Can you help me plan a trip to Zanzibar?
        </p>
        <p>
          <b>Kwoat</b> Absolutely — when are you thinking of going, and is this more beaches or culture?
        </p>
      </div>
    </div>
  )
}

const MISSION = [
  ['think', 'Planning the build'],
  ['search', 'Searching best practices'],
  ['write', 'src/server.ts'],
  ['write', 'src/auth/jwt.ts'],
  ['run', 'Running tests — 23/24'],
  ['fix', 'Fixing token expiry'],
  ['run', 'Running tests — 24/24'],
  ['done', '14 files ready'],
]

function MissionDemo() {
  const [n, setN] = useState(0)
  const [ref, inView] = useInView<HTMLDivElement>()
  useEffect(() => {
    if (!inView) return
    const id = setInterval(() => setN((v) => (v >= MISSION.length + 3 ? 0 : v + 1)), 650)
    return () => clearInterval(id)
  }, [inView])
  return (
    <div ref={ref} className="md">
      <div className="md-head">
        <span className="dot pulse" style={{ background: 'var(--violet-2)', color: 'var(--violet-2)' }} /> Mission running
        <span className="md-step">Step {Math.min(n, MISSION.length)}</span>
      </div>
      <ul>
        {MISSION.slice(0, n).map(([k, label], i) => (
          <li key={i} className={`md-${k}`}>
            <span className="md-ico">{k === 'done' ? '✓' : k === 'fix' ? '⟲' : k === 'run' ? '▶' : k === 'search' ? '⌕' : k === 'think' ? '✦' : '+'}</span>
            <span className="md-kind">{k}</span>
            {label}
          </li>
        ))}
      </ul>
    </div>
  )
}

function UsageDemo() {
  const [ref, inView] = useInView<HTMLDivElement>()
  const bars = [32, 54, 41, 68, 47, 80, 62, 90, 58, 74, 66, 95]
  useEffect(() => {
    if (!inView || !ref.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.ud-bar', { scaleY: 0 }, { scaleY: 1, transformOrigin: 'bottom', stagger: 0.05, duration: 1, ease: 'expo.out' })
      const o = { v: 0 }
      gsap.to(o, { v: 1284, duration: 1.8, ease: 'power3.out', onUpdate: () => (ref.current!.querySelector('.ud-total b')!.textContent = Math.round(o.v).toLocaleString()) })
    }, ref)
    return () => ctx.revert()
  }, [inView, ref])
  return (
    <div ref={ref} className="ud">
      <div className="ud-total">
        <span>Credits this month</span>
        <b>0</b>
      </div>
      <div className="ud-chart">
        {bars.map((b, i) => (
          <span key={i} className="ud-bar" style={{ height: `${b}%` }} />
        ))}
      </div>
      <div className="ud-legend">
        <span>
          <i style={{ background: '#fbbf24' }} />
          Claude 41%
        </span>
        <span>
          <i style={{ background: '#34d399' }} />
          GPT 33%
        </span>
        <span>
          <i style={{ background: '#22d3ee' }} />
          Gemini 26%
        </span>
      </div>
    </div>
  )
}

// Refresh pinned sections once fonts settle so measurements are right
if (typeof document !== 'undefined' && 'fonts' in document) {
  document.fonts.ready.then(() => ScrollTrigger.refresh())
}
