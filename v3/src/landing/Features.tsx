import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/motion'
import { Icon, type IconName } from '../components/ui'
import { useInView, useSpotlight } from '../lib/hooks'

export function Features() {
  const spot = useSpotlight<HTMLDivElement>()
  const root = useRef<HTMLElement>(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.bento > *', {
        y: 40,
        opacity: 0,
        filter: 'blur(8px)',
        duration: 1.3,
        ease: 'kwoat',
        stagger: 0.08,
        scrollTrigger: { trigger: '.bento', start: 'top 80%' },
      })
    }, root)
    return () => ctx.revert()
  }, [])
  return (
    <section ref={root} className="features" id="features">
      <div className="container">
        <div className="sec-head">
          <span className="kicker">Everything in one place</span>
          <h2 className="h-lg metal">
            One platform.
            <br />
            Every capability.
          </h2>
          <p className="lede">Chat, compare, create images, talk out loud, and send an agent off to do the work — all from the same wallet.</p>
        </div>
        <div ref={spot} className="bento">
          <Tile className="b-compare" icon="compare" title="Compare mode" body="Run one prompt across four models at once. See every answer and what each cost, then keep the best.">
            <CompareDemo />
          </Tile>
          <Tile className="b-image" icon="image" title="Image generation" body="FLUX.2 Klein and Nano Banana 2, saved to your gallery automatically.">
            <ImageDemo />
          </Tile>
          <Tile className="b-voice" icon="mic" title="Voice live" body="A real-time, two-way call with any model. Interrupt it any time.">
            <VoiceDemo />
          </Tile>
          <Tile className="b-mission" icon="rocket" title="Agent missions" body="Give it a goal. It researches, codes, tests and hands you the files.">
            <MissionDemo />
          </Tile>
          <Tile className="b-usage" icon="chart" title="Usage analytics" body="Every reply shows its cost. Track spend by model and day.">
            <UsageDemo />
          </Tile>
        </div>
      </div>
    </section>
  )
}

function Tile({ className, icon, title, body, children }: { className: string; icon: IconName; title: string; body: string; children: React.ReactNode }) {
  return (
    <article className={`tile panel spot ${className}`}>
      <div className="tile-visual">{children}</div>
      <div className="tile-copy">
        <h3>
          <Icon name={icon} size={16} /> {title}
        </h3>
        <p>{body}</p>
      </div>
    </article>
  )
}

/* ---------------- demos ---------------- */

const COLS = [
  { n: 'Claude Sonnet 4.6', c: '#fbbf24', cr: 6, s: 1, best: true },
  { n: 'GPT-5.4', c: '#34d399', cr: 6, s: 1.25 },
  { n: 'Gemini 3.1 Pro', c: '#22d3ee', cr: 5, s: 0.85 },
  { n: 'Grok 4.20', c: '#f472b6', cr: 2, s: 1.5 },
]

function CompareDemo() {
  const [ref, inView] = useInView<HTMLDivElement>()
  useEffect(() => {
    if (!inView || !ref.current) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.cmp-c').forEach((c, i) => {
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.2 })
        tl.set(c.querySelectorAll('.cmp-l'), { scaleX: 0 })
          .set(c.querySelector('.cmp-f'), { opacity: 0 })
          .to(c.querySelectorAll('.cmp-l'), { scaleX: 1, duration: 0.45, ease: 'power2.out', stagger: 0.28 / COLS[i].s })
          .to(c.querySelector('.cmp-f'), { opacity: 1, duration: 0.4 })
      })
    }, ref)
    return () => ctx.revert()
  }, [inView, ref])
  return (
    <div ref={ref} className="cmp">
      {COLS.map((c, i) => (
        <div key={c.n} className={`cmp-c ${c.best ? 'is-best' : ''}`}>
          <div className="cmp-h">
            <i style={{ background: c.c }} />
            {c.n}
          </div>
          {Array.from({ length: 6 }).map((_, k) => (
            <span key={k} className="cmp-l" style={{ width: `${58 + ((k * 31 + i * 17) % 40)}%` }} />
          ))}
          <div className="cmp-f mono">
            <span>{c.cr} cr</span>
            {c.best && <b>Best</b>}
          </div>
        </div>
      ))}
    </div>
  )
}

function ImageDemo() {
  const [ref, inView] = useInView<HTMLDivElement>()
  const [k, setK] = useState(0)
  useEffect(() => {
    if (!inView) return
    const id = setInterval(() => setK((x) => x + 1), 2600)
    return () => clearInterval(id)
  }, [inView])
  const hues = [262, 18, 190, 300, 40, 220, 330, 150]
  return (
    <div ref={ref} className="img">
      {[0, 1, 2, 3].map((i) => {
        const h = hues[(i + k) % hues.length]
        return (
          <div key={`${i}-${k}`} className="img-t" style={{ ['--h' as string]: h, animationDelay: `${i * 120}ms` }}>
            <span />
          </div>
        )
      })}
      <div className="img-prompt">
        <Icon name="sparkle" size={13} /> neon fox, rainy alley, cinematic
      </div>
    </div>
  )
}

function VoiceDemo() {
  const c = useRef<HTMLCanvasElement>(null)
  const [ref, inView] = useInView<HTMLDivElement>()
  useEffect(() => {
    const cv = c.current
    if (!cv || !inView) return
    const g = cv.getContext('2d')!
    let raf = 0
    const draw = (t: number) => {
      const s = (cv.width = cv.height = cv.clientWidth * 2)
      g.clearRect(0, 0, s, s)
      const cx = s / 2
      const R = s * 0.27
      const talk = (Math.sin(t / 1100) + 1) / 2
      for (let ring = 0; ring < 3; ring++) {
        g.beginPath()
        for (let a = 0; a <= Math.PI * 2 + 0.02; a += Math.PI / 120) {
          const n = Math.sin(a * (5 + ring * 2) + t / (300 + ring * 90)) * Math.sin(a * 3 - t / 700)
          const r = R + ring * 9 + n * (6 + talk * 18)
          const x = cx + Math.cos(a) * r
          const y = cx + Math.sin(a) * r
          if (a === 0) g.moveTo(x, y)
          else g.lineTo(x, y)
        }
        g.strokeStyle = ring === 0 ? 'rgba(196,181,253,0.95)' : `rgba(139,92,246,${0.5 - ring * 0.15})`
        g.lineWidth = ring === 0 ? 3 : 2
        g.stroke()
      }
      const grd = g.createRadialGradient(cx, cx, 0, cx, cx, R * 0.85)
      grd.addColorStop(0, 'rgba(139,92,246,0.55)')
      grd.addColorStop(1, 'rgba(139,92,246,0)')
      g.fillStyle = grd
      g.beginPath()
      g.arc(cx, cx, R * 0.85, 0, Math.PI * 2)
      g.fill()
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [inView])
  return (
    <div ref={ref} className="vo">
      <canvas ref={c} />
      <span className="vo-t mono">00:42 · Gemini 2.5 Flash</span>
    </div>
  )
}

const STEPS = ['Planning the build', 'Searching best practices', 'Writing src/server.ts', 'Writing src/auth/jwt.ts', 'Running tests — 23/24', 'Fixing token expiry', 'Running tests — 24/24', '14 files ready']

function MissionDemo() {
  const [ref, inView] = useInView<HTMLDivElement>()
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!inView) return
    const id = setInterval(() => setN((v) => (v >= STEPS.length + 2 ? 0 : v + 1)), 750)
    return () => clearInterval(id)
  }, [inView])
  const shown = STEPS.slice(Math.max(0, n - 4), n)
  return (
    <div ref={ref} className="ms">
      {shown.map((s, i) => {
        const idx = Math.max(0, n - 4) + i
        const done = idx < n - 1 || idx === STEPS.length - 1
        return (
          <div key={s} className={`ms-row ${done ? 'is-done' : 'is-run'}`}>
            <span className="ms-dot">{done ? <Icon name="check" size={11} /> : <i className="spinner" />}</span>
            {s}
          </div>
        )
      })}
    </div>
  )
}

function UsageDemo() {
  const [ref, inView] = useInView<HTMLDivElement>()
  const pts = [22, 30, 26, 38, 34, 48, 44, 58, 52, 64, 60, 76]
  const W = 300
  const H = 110
  const xy = pts.map((v, i) => [(i / (pts.length - 1)) * W, H - (v / 80) * H])
  const line = xy.reduce((p, [x, y], i) => (i === 0 ? `M${x},${y}` : `${p} C${xy[i - 1][0] + 12},${xy[i - 1][1]} ${x - 12},${y} ${x},${y}`), '')
  useEffect(() => {
    if (!inView || !ref.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.us-line', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' })
      gsap.fromTo('.us-area', { opacity: 0 }, { opacity: 1, duration: 1.2, delay: 0.8 })
      const o = { v: 0 }
      gsap.to(o, { v: 1284, duration: 1.8, ease: 'power3.out', onUpdate: () => {
        const el = ref.current?.querySelector('.us-n')
        if (el) el.textContent = Math.round(o.v).toLocaleString('en-US')
      } })
    }, ref)
    return () => ctx.revert()
  }, [inView, ref])
  return (
    <div ref={ref} className="us">
      <div className="us-k">
        <span className="us-n">0</span>
        <span className="mono">credits · 30d</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="usg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#8b5cf6" stopOpacity="0.35" />
            <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="us-area" d={`${line} L${W},${H} L0,${H} Z`} fill="url(#usg)" />
        <path className="us-line" d={line} pathLength={1} />
      </svg>
    </div>
  )
}
