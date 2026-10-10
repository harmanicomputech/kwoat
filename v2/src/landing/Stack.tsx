import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/motion'
import { Btn, Section } from '../components/ui'
import { useInView } from '../lib/hooks'

// Feature cards pinned on top of each other. As the next card slides over,
// the one beneath sinks back and dims, like a stack of prints.

const CARDS = [
  {
    n: '03.1',
    kicker: 'Compare',
    title: (
      <>
        Same prompt.
        <br />
        <em>Four voices.</em>
      </>
    ),
    body: 'Run Claude, GPT, Gemini and Grok on one prompt at the same time. Hear them out, see what each costs, keep the best.',
    to: '/app/compare',
    Demo: Console,
  },
  {
    n: '03.2',
    kicker: 'Images',
    title: (
      <>
        Make it.
        <br />
        <em>Keep all of it.</em>
      </>
    ),
    body: 'FLUX.2 Klein and Nano Banana 2 in the same chat. Every image lands in your gallery, ready to vary or download.',
    to: '/app/gallery',
    Demo: Prints,
  },
  {
    n: '03.3',
    kicker: 'Voice live',
    title: (
      <>
        Talk to it
        <br />
        <em>like a call.</em>
      </>
    ),
    body: 'Real-time, two-way voice with any model. Interrupt it mid-sentence. The transcript is waiting in your chat when you hang up.',
    to: '/app/voice',
    Demo: Scope,
  },
  {
    n: '03.4',
    kicker: 'Agent missions',
    title: (
      <>
        Give it a goal.
        <br />
        <em>Get the files.</em>
      </>
    ),
    body: 'The agent searches, writes code, runs it in a live sandbox, fixes what breaks, and hands you finished work.',
    to: '/app/missions',
    Demo: Terminal,
  },
  {
    n: '03.5',
    kicker: 'Usage',
    title: (
      <>
        Every credit,
        <br />
        <em>on the record.</em>
      </>
    ),
    body: 'Each reply shows what it cost. Break spend down by model, feature and day. No subscription roulette, no surprise bill.',
    to: '/app/usage',
    Demo: Ledger,
  },
]

export function Stack() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.st-card')
      cards.forEach((card, i) => {
        const next = cards[i + 1]
        if (!next) return
        const st = { trigger: next, start: 'top 70%', end: 'top 20%', scrub: true }
        gsap.to(card.querySelector('.st-inner'), { scale: 0.92, ease: 'none', scrollTrigger: st })
        gsap.to(card.querySelector('.st-shade'), { opacity: 0.55, ease: 'none', scrollTrigger: st })
      })
      gsap.from('.st-intro .display', {
        yPercent: 30,
        opacity: 0,
        duration: 1.4,
        ease: 'kwoat',
        scrollTrigger: { trigger: '.st-intro', start: 'top 80%' },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <Section id="stack" index="03" title="Capabilities" className="stack">
      <div ref={root} className="container">
        <div className="st-intro">
          <h2 className="display">
            One platform.
            <br />
            <em>Every</em> capability.
          </h2>
        </div>
        {CARDS.map((c, i) => (
          <article className="st-card" key={c.n} style={{ ['--i' as string]: i }}>
            <div className="st-inner">
              <span className="st-shade" aria-hidden />
              <div className="st-copy">
                <div className="st-top">
                  <span className="label">
                    <b>{c.n}</b>
                  </span>
                  <span className="label">{c.kicker}</span>
                </div>
                <h3 className="display">{c.title}</h3>
                <p>{c.body}</p>
                <Btn to={c.to} variant="line" size="sm">
                  Try it free
                </Btn>
              </div>
              <div className="st-demo">
                <c.Demo />
              </div>
            </div>
          </article>
        ))}
      </div>
    </Section>
  )
}

/* ---------------- Demos ---------------- */

function Console() {
  const [ref, inView] = useInView<HTMLDivElement>()
  const ch = [
    { name: 'GPT-5.4', c: '#34d399', cr: 6 },
    { name: 'Claude 4.6', c: '#fbbf24', cr: 6, solo: true },
    { name: 'Gemini 3.1', c: '#22d3ee', cr: 5 },
    { name: 'Grok 4.20', c: '#f472b6', cr: 2 },
  ]
  return (
    <div ref={ref} className={`console ${inView ? 'is-live' : ''}`}>
      {ch.map((x, i) => (
        <div key={x.name} className={`cs-strip ${x.solo ? 'is-solo' : ''}`}>
          <span className="cs-led" style={{ background: x.c }} />
          <div className="cs-vu">
            {Array.from({ length: 16 }).map((_, k) => (
              <i key={k} style={{ animationDelay: `${(k * 53 + i * 211) % 900}ms`, animationDuration: `${700 + i * 130}ms` }} />
            ))}
          </div>
          <div className="cs-fader">
            <span style={{ bottom: `${[62, 84, 55, 40][i]}%` }} />
          </div>
          <span className="cs-name">{x.name}</span>
          <span className="cs-cr">{x.cr} cr</span>
          <span className={`cs-btn ${x.solo ? 'on' : ''}`}>{x.solo ? 'Best' : 'Solo'}</span>
        </div>
      ))}
    </div>
  )
}

function Prints() {
  const [ref, inView] = useInView<HTMLDivElement>()
  useEffect(() => {
    if (!inView || !ref.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.pr-print',
        { clipPath: 'inset(0 0 100% 0)' },
        { clipPath: 'inset(0 0 0% 0)', duration: 1.6, ease: 'expo.inOut', stagger: 0.15 },
      )
      gsap.fromTo('.pr-scan', { top: '0%' }, { top: '100%', duration: 1.6, ease: 'expo.inOut', stagger: 0.15 })
    }, ref)
    return () => ctx.revert()
  }, [inView, ref])
  const prints = [
    { h: 18, t: 'Neon fox, rainy alley', m: 'FLUX.2' },
    { h: 200, t: 'Minimal dial logo', m: 'Nano Banana 2' },
    { h: 290, t: 'Isometric island', m: 'FLUX.2' },
  ]
  return (
    <div ref={ref} className="prints">
      {prints.map((p, i) => (
        <figure key={i} className="pr-fig" style={{ ['--h' as string]: p.h }}>
          <div className="pr-print">
            <div className="pr-art" />
            <div className="pr-dots" />
            <span className="pr-scan" />
          </div>
          <figcaption className="label">
            <b>{String(i + 1).padStart(2, '0')}</b> {p.t} · {p.m}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

function Scope() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [ref, inView] = useInView<HTMLDivElement>()
  useEffect(() => {
    const c = canvas.current
    if (!c || !inView) return
    const g = c.getContext('2d')!
    let raf = 0
    const draw = (t: number) => {
      const w = (c.width = c.clientWidth * 2)
      const h = (c.height = c.clientHeight * 2)
      g.fillStyle = 'rgba(14,14,12,1)'
      g.fillRect(0, 0, w, h)
      g.strokeStyle = 'rgba(236,235,228,0.08)'
      g.lineWidth = 1
      for (let x = 0; x < w; x += w / 10) {
        g.beginPath()
        g.moveTo(x, 0)
        g.lineTo(x, h)
        g.stroke()
      }
      for (let y = 0; y < h; y += h / 6) {
        g.beginPath()
        g.moveTo(0, y)
        g.lineTo(w, y)
        g.stroke()
      }
      const talk = Math.max(0, Math.sin(t / 1400))
      const lines = [
        { col: '#ff4f1a', a: 0.32, f: 9, s: 260 },
        { col: 'rgba(236,235,228,0.9)', a: 0.18, f: 17, s: 140 },
      ]
      lines.forEach((L) => {
        g.beginPath()
        for (let x = 0; x <= w; x += 3) {
          const p = x / w
          const env = Math.sin(p * Math.PI)
          const y = h / 2 + Math.sin(p * L.f * Math.PI + t / L.s) * Math.sin(p * 3 + t / 900) * h * L.a * env * (0.25 + talk)
          if (x === 0) g.moveTo(x, y)
          else g.lineTo(x, y)
        }
        g.strokeStyle = L.col
        g.lineWidth = 3
        g.shadowColor = L.col
        g.shadowBlur = 16
        g.stroke()
        g.shadowBlur = 0
      })
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [inView])
  return (
    <div ref={ref} className="scope">
      <div className="scope-top label">
        <span>
          <span className="led blink" /> Live · 00:42
        </span>
        <span>Gemini 2.5 Flash</span>
      </div>
      <canvas ref={canvas} />
      <div className="scope-tr">
        <p>
          <b>You</b> Can you help me plan a weekend in Zanzibar?
        </p>
        <p>
          <b>Kwoat</b> Absolutely — beaches, or Stone Town’s history? I’d do both: …
        </p>
      </div>
    </div>
  )
}

const LOG = [
  ['plan', 'Express + TypeScript, JWT, Postgres, Zod'],
  ['search', 'refresh-token rotation best practice'],
  ['write', 'src/server.ts'],
  ['write', 'src/auth/jwt.ts'],
  ['write', 'src/db/migrate.ts'],
  ['run', 'npm test → 23 passed, 1 failed'],
  ['fix', 'expiry used seconds, expected ms'],
  ['run', 'npm test → 24 passed'],
  ['done', '14 files ready · download.zip'],
]

function Terminal() {
  const [n, setN] = useState(0)
  const [ref, inView] = useInView<HTMLDivElement>()
  useEffect(() => {
    if (!inView) return
    const id = setInterval(() => setN((v) => (v > LOG.length + 2 ? 0 : v + 1)), 700)
    return () => clearInterval(id)
  }, [inView])
  return (
    <div ref={ref} className="term">
      <div className="term-top label">
        <span>mission_0042</span>
        <span>step {String(Math.min(n, LOG.length)).padStart(2, '0')}/09</span>
      </div>
      <div className="term-body">
        <p className="term-goal">$ kwoat mission "REST API with JWT auth"</p>
        {LOG.slice(0, n).map(([k, t], i) => (
          <p key={i} className={`term-l t-${k}`}>
            <span>[{k.padEnd(6, ' ')}]</span> {t}
          </p>
        ))}
        {n <= LOG.length && <span className="term-cur" />}
      </div>
    </div>
  )
}

function Ledger() {
  const [ref, inView] = useInView<HTMLDivElement>()
  const items = [
    ['09:12', 'Poem for Mum', 'Gemini 2.5 Flash', 1],
    ['09:40', 'Fix auth bug', 'GPT-5.4', 6],
    ['10:05', 'Bakery landing page', 'Claude Sonnet 4.6', 6],
    ['11:31', 'Logo concepts ×4', 'FLUX.2 Klein', 16],
    ['12:02', 'Churn analysis', 'Gemini 3.1 Pro', 5],
    ['13:18', 'Compare ×4 models', 'Compare', 18],
  ] as const
  useEffect(() => {
    if (!inView || !ref.current) return
    const ctx = gsap.context(() => {
      gsap.from('.lg-row', { opacity: 0, x: -14, stagger: 0.09, duration: 0.7, ease: 'kwoat' })
      const o = { v: 0 }
      gsap.to(o, {
        v: 52,
        duration: 1.6,
        delay: 0.4,
        ease: 'power3.out',
        onUpdate: () => {
          const el = ref.current?.querySelector('.lg-total b')
          if (el) el.textContent = Math.round(o.v).toString()
        },
      })
    }, ref)
    return () => ctx.revert()
  }, [inView, ref])
  return (
    <div ref={ref} className="ledger">
      <div className="lg-head label">
        <span>Kwoat · statement</span>
        <span>Today</span>
      </div>
      {items.map(([t, what, model, cr]) => (
        <div className="lg-row" key={t}>
          <span className="label">{t}</span>
          <span>{what}</span>
          <span className="label">{model}</span>
          <span className="lg-cr">{cr}</span>
        </div>
      ))}
      <div className="lg-total">
        <span className="label">Total</span>
        <span>
          <b>0</b> cr
        </span>
      </div>
      <div className="lg-tear" />
    </div>
  )
}
