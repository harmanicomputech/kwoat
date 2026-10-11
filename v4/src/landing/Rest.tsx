import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap, ScrollTrigger, SplitText, scrollToTarget } from '../lib/motion'
import { Arrow, Icon, Logo, Magnetic, Mark } from '../components/ui'
import { useTilt } from '../lib/hooks'
import { api, MODELS, modelById } from '../api'

/* ============================ Live playground ============================ */

const PICKS = ['gpt-5.4', 'claude-sonnet-4.6', 'gemini-3.1-pro', 'grok-4.20']

/** A real, working compare demo on the landing page: type, run, watch four models stream. */
export function Playground() {
  const [prompt, setPrompt] = useState('Explain quantum computing to a 12-year-old')
  const [out, setOut] = useState<Record<string, { text: string; done: boolean; ms: number }>>({})
  const [running, setRunning] = useState(false)
  const [best, setBest] = useState<string | null>(null)
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.pg-col', { y: 60, opacity: 0, rotateX: -25, transformOrigin: '50% 0%', duration: 1.2, ease: 'kwoat', stagger: 0.08, scrollTrigger: { trigger: '.pg-cols', start: 'top 85%' } })
    }, root)
    return () => ctx.revert()
  }, [])

  const run = async () => {
    if (running) return
    setRunning(true)
    setBest(null)
    const t0 = performance.now()
    setOut(Object.fromEntries(PICKS.map((id) => [id, { text: '', done: false, ms: 0 }])))
    await Promise.all(
      PICKS.map((id) =>
        api.streamChat(prompt, id, {
          onToken: (t) => setOut((o) => ({ ...o, [id]: { ...o[id], text: o[id].text + t } })),
          onDone: () => setOut((o) => ({ ...o, [id]: { ...o[id], done: true, ms: Math.round(performance.now() - t0) } })),
        }),
      ),
    )
    setRunning(false)
  }
  const doneList = PICKS.filter((id) => out[id]?.done).sort((a, b) => out[a].ms - out[b].ms)

  return (
    <section ref={root} className="playground">
      <div className="container">
        <div className="sec-head">
          <span className="eyebrow">Try it right here</span>
          <h2 className="display h-sec">
            Same prompt. <span className="grad-text">Four models.</span>
          </h2>
          <p className="lede">This is a live demo — type anything and run it. Four models answer side by side, each with its cost.</p>
        </div>
        <div className="pg glass">
          <div className="pg-bar">
            <input value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && run()} aria-label="Prompt to compare" />
            <span className="pg-est mono">est. {PICKS.reduce((n, id) => n + (modelById(id)?.cost ?? 0), 0)} cr</span>
            <Magnetic className="btn btn-primary" onClick={run} disabled={running}>
              {running ? <span className="spinner" /> : <Icon name="compare" size={16} />} {running ? 'Running…' : 'Run'}
            </Magnetic>
          </div>
          <div className="pg-cols">
            {PICKS.map((id) => {
              const m = modelById(id)!
              const o = out[id]
              const rank = doneList.indexOf(id)
              return (
                <article key={id} className={`pg-col ${best === id ? 'is-best' : ''} ${o && !o.done ? 'is-live' : ''}`}>
                  <header>
                    <span className="pg-name">
                      <i style={{ background: m.color }} />
                      {m.name}
                    </span>
                    {rank === 0 && <span className="pg-tag">⚡ Fastest</span>}
                  </header>
                  <div className="pg-text">
                    {o ? (
                      <>
                        {o.text}
                        {!o.done && <span className="caret" />}
                      </>
                    ) : (
                      <span className="pg-ph">Waiting for your prompt…</span>
                    )}
                  </div>
                  <footer>
                    <span className="mono">{o?.done ? `${(o.ms / 1000).toFixed(1)}s · ${m.cost} cr` : `~${m.cost} cr`}</span>
                    <button className={`pg-keep ${best === id ? 'is-on' : ''}`} disabled={!o?.done} onClick={() => setBest(id)}>
                      {best === id ? '★ Kept' : 'Keep'}
                    </button>
                  </footer>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ============================ 3D screenshot carousel ============================ */

const SHOTS = [
  { k: 'Compare', src: '/shots/compare_panel.png' },
  { k: 'Documents', src: '/shots/document_html.webp' },
  { k: 'Gallery', src: '/shots/gallery_image.webp' },
  { k: 'Missions', src: '/shots/missions.png' },
  { k: 'Voice', src: '/shots/voice_live_mode.png' },
  { k: 'Usage', src: '/shots/usage_analytics.png' },
]

/** The client's real screens on a 3D ring that turns with scroll and can be dragged. */
export function Tour() {
  const root = useRef<HTMLElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const [front, setFront] = useState(0)

  useEffect(() => {
    const step = 360 / SHOTS.length
    const state = { scroll: 0, drag: 0, v: 0 }
    const apply = () => {
      const a = state.scroll + state.drag
      if (ring.current) ring.current.style.transform = `translateZ(calc(var(--r) * -1)) rotateY(${a}deg)`
      setFront((((Math.round(-a / step) % SHOTS.length) + SHOTS.length) % SHOTS.length))
    }
    const st = ScrollTrigger.create({
      trigger: root.current,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1,
      onUpdate: (s) => {
        state.scroll = -s.progress * 360
        apply()
      },
    })
    // drag with inertia
    let down = false
    let lastX = 0
    let raf = 0
    const el = ring.current!.parentElement!
    const pd = (e: PointerEvent) => {
      down = true
      lastX = e.clientX
      el.setPointerCapture(e.pointerId)
      cancelAnimationFrame(raf)
    }
    const pm = (e: PointerEvent) => {
      if (!down) return
      state.v = (e.clientX - lastX) * 0.25
      state.drag += state.v
      lastX = e.clientX
      apply()
    }
    const pu = () => {
      down = false
      const glide = () => {
        state.v *= 0.94
        state.drag += state.v
        apply()
        if (Math.abs(state.v) > 0.05) raf = requestAnimationFrame(glide)
      }
      raf = requestAnimationFrame(glide)
    }
    el.addEventListener('pointerdown', pd)
    el.addEventListener('pointermove', pm)
    el.addEventListener('pointerup', pu)
    el.addEventListener('pointercancel', pu)
    apply()
    return () => {
      st.kill()
      cancelAnimationFrame(raf)
      el.removeEventListener('pointerdown', pd)
      el.removeEventListener('pointermove', pm)
      el.removeEventListener('pointerup', pu)
      el.removeEventListener('pointercancel', pu)
    }
  }, [])

  return (
    <section ref={root} className="tour" id="tour">
      <div className="container">
        <div className="sec-head">
          <span className="eyebrow">Inside the app</span>
          <h2 className="display h-sec">
            Built for <span className="grad-text">doing.</span>
          </h2>
          <p className="lede">The real Kwoat app. Scroll, or drag the ring.</p>
        </div>
      </div>
      <div className="carousel" data-cursor-label="Drag">
        <div ref={ring} className="ring">
          {SHOTS.map((s, i) => (
            <figure key={s.k} className={`slide ${i === front ? 'is-front' : ''}`} style={{ ['--i' as string]: i, ['--n' as string]: SHOTS.length }}>
              <div className="slide-chrome">
                <span />
                <span />
                <span />
                <em className="mono">kwoat.ai/{s.k.toLowerCase()}</em>
              </div>
              <img src={s.src} alt={`Kwoat ${s.k}`} loading="lazy" draggable={false} />
              <figcaption>{s.k}</figcaption>
            </figure>
          ))}
        </div>
      </div>
      <div className="tour-dots">
        {SHOTS.map((s, i) => (
          <span key={s.k} className={i === front ? 'is-on' : ''}>
            {s.k}
          </span>
        ))}
      </div>
    </section>
  )
}

/* ============================ Stats + testimonials ============================ */

const STATS = [
  { v: 13, s: '+', l: 'Frontier models' },
  { v: 50, s: '', l: 'Free credits, every day' },
  { v: 0.4, s: 's', l: 'Average routing decision', d: 1 },
  { v: 1, s: ' wallet', l: 'Instead of five subscriptions' },
]

export function Stats() {
  const root = useRef<HTMLElement>(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.stat-n').forEach((el, i) => {
        const o = { v: 0 }
        gsap.to(o, { v: STATS[i].v, duration: 2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' }, onUpdate: () => (el.textContent = o.v.toFixed(STATS[i].d ?? 0)) })
      })
      gsap.from('.stat', { y: 50, opacity: 0, duration: 1.2, ease: 'kwoat', stagger: 0.1, scrollTrigger: { trigger: '.stats', start: 'top 80%' } })
    }, root)
    return () => ctx.revert()
  }, [])
  return (
    <section ref={root} className="stats">
      <div className="container stats-grid">
        {STATS.map((s) => (
          <div key={s.l} className="stat">
            <div className="stat-v display">
              <span className="stat-n">0</span>
              <span className="grad-text">{s.s}</span>
            </div>
            <p>{s.l}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

const QUOTES = [
  { q: 'Really fast — way quicker than switching between tabs.', r: 'Beta user' },
  { q: 'Exactly what I was looking for. One place for everything.', r: 'Beta user' },
  { q: 'The UI/UX is so beautiful. Feels premium.', r: 'Beta user' },
]

function QuoteCard({ q, r, i }: { q: string; r: string; i: number }) {
  const ref = useTilt<HTMLElement>(10)
  return (
    <figure ref={ref} className="quote card" style={{ ['--i' as string]: i }}>
      <span className="quote-glare" />
      <Mark size={20} />
      <blockquote>“{q}”</blockquote>
      <figcaption>{r}</figcaption>
    </figure>
  )
}

export function Voices() {
  const root = useRef<HTMLElement>(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      const split = SplitText.create('.voices .display', { type: 'words', wordsClass: 'w' })
      gsap.from(split.words, { opacity: 0.08, stagger: 0.05, ease: 'none', scrollTrigger: { trigger: '.voices .display', start: 'top 85%', end: 'bottom 55%', scrub: true } })
      gsap.from('.quote', { y: 120, rotate: (i) => [-8, 4, 10][i], opacity: 0, duration: 1.4, ease: 'kwoat', stagger: 0.12, scrollTrigger: { trigger: '.quotes', start: 'top 85%' } })
      gsap.utils.toArray<HTMLElement>('.quote').forEach((q, i) => {
        gsap.to(q, { y: [-40, 30, -70][i], ease: 'none', scrollTrigger: { trigger: '.quotes', start: 'top bottom', end: 'bottom top', scrub: true } })
      })
    }, root)
    return () => ctx.revert()
  }, [])
  return (
    <section ref={root} className="voices">
      <div className="container">
        <p className="display voices-line">
          Five subscriptions, five tabs, and you still had to guess which model to use. Kwoat puts every frontier AI behind one prompt box — and tells you what each answer cost.
        </p>
        <div className="quotes">
          {QUOTES.map((q, i) => (
            <QuoteCard key={q.q} {...q} i={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================ FAQ ============================ */

const FAQS = [
  ['How does Kwoat choose a model?', 'It reads your prompt — the task, the language, how hard it is — and sends it to the model that handles that kind of request best at the lowest cost that does the job well. You can always choose a model yourself.'],
  ['What is a credit?', 'Credits are how Kwoat prices each reply. Quick questions on fast models cost about 1 credit; heavy reasoning or premium models cost more. Every response shows exactly what it used.'],
  ['Do credits expire?', 'Free daily credits reset every day. Credits you top up in your wallet never expire.'],
  ['Which models are included?', 'GPT, Claude, Gemini, Grok, Llama, Mistral, FLUX and Nano Banana, among others. Claude Sonnet and Opus are included from the Pro plan.'],
  ['Can I cancel any time?', 'Yes. Plans are month to month (or yearly with a month free), and your wallet balance stays yours.'],
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="faq" id="faq">
      <div className="container faq-grid">
        <div className="faq-side">
          <span className="eyebrow">FAQ</span>
          <h2 className="display h-sec">Questions, answered.</h2>
          <p className="lede">
            Still curious? <a href="mailto:hello@kwoat.ai">Talk to us</a>.
          </p>
        </div>
        <div className="faq-list">
          {FAQS.map(([q, a], i) => (
            <div key={q} className={`faq-item card ${open === i ? 'is-open' : ''}`}>
              <button aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
                {q}
                <span className="faq-ic" aria-hidden>
                  <Icon name="plus" size={16} />
                </span>
              </button>
              <div className="faq-a">
                <p>{a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================ Final CTA ============================ */

export function Finale() {
  const root = useRef<HTMLElement>(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.fin-card', { scale: 0.82, borderRadius: '80px', y: 60 }, { scale: 1, borderRadius: '36px', y: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top 25%', scrub: true } })
      gsap.utils.toArray<HTMLElement>('.fin-ray').forEach((r, i) => {
        gsap.fromTo(r, { rotate: (i - 2) * 22, scaleY: 0.2 }, { rotate: (i - 2) * 9, scaleY: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'center center', scrub: true } })
      })
      const split = SplitText.create('.fin-title', { type: 'chars', charsClass: 'ch', mask: 'chars' })
      gsap.from(split.chars, { yPercent: 110, stagger: 0.02, duration: 1.2, ease: 'kwoat', scrollTrigger: { trigger: '.fin-title', start: 'top 80%' } })
    }, root)
    return () => ctx.revert()
  }, [])
  return (
    <section ref={root} className="finale">
      <div className="container">
        <div className="fin-card">
          <div className="fin-rays" aria-hidden>
            {Array.from({ length: 5 }).map((_, i) => (
              <i key={i} className="fin-ray" />
            ))}
          </div>
          <div className="fin-content">
            <h2 className="fin-title display">
              Every AI model.
              <br />
              One wallet.
            </h2>
            <p>Stop managing five separate subscriptions. Start on Kwoat free — no card needed.</p>
            <div className="fin-actions">
              <Magnetic to="/signup" className="btn btn-lg fin-btn">
                Start for free <Arrow />
              </Magnetic>
              <Magnetic className="btn btn-lg fin-ghost" onClick={() => scrollToTarget('#faq')}>
                Read the FAQ
              </Magnetic>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  const root = useRef<HTMLElement>(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.fw-l', { yPercent: 100 }, { yPercent: 0, stagger: 0.05, ease: 'none', scrollTrigger: { trigger: '.fw', start: 'top bottom', end: 'bottom bottom', scrub: true } })
    }, root)
    return () => ctx.revert()
  }, [])
  return (
    <footer ref={root} className="footer">
      <div className="container foot-top">
        <div className="foot-brand">
          <Logo />
          <p>AI models, one platform.</p>
          <span className="chip">
            <span className="dot pulse" style={{ background: 'var(--ok)', color: 'var(--ok)' }} /> All models operational
          </span>
        </div>
        <nav className="foot-cols" aria-label="Footer">
          <div>
            <h4>Product</h4>
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#app">Mobile apps</a>
            <Link to="/app">Open app</Link>
          </div>
          <div>
            <h4>Models</h4>
            {MODELS.slice(4, 8).map((m) => (
              <span key={m.id}>{m.name}</span>
            ))}
          </div>
          <div>
            <h4>Company</h4>
            <a href="#faq">FAQ</a>
            <a href="#top">Privacy</a>
            <a href="#top">Terms</a>
          </div>
        </nav>
      </div>
      <div className="fw" aria-hidden>
        {'kwoat'.split('').map((c, i) => (
          <span key={i} className="fw-l">
            {c}
          </span>
        ))}
      </div>
      <div className="container foot-bottom">
        <span>© {new Date().getFullYear()} Kwoat Technologies, LLC</span>
        <span>Stop choosing. Start doing.</span>
      </div>
    </footer>
  )
}
