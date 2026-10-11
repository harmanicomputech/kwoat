import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap, ScrollTrigger, SplitText, scrollToTarget, prefersReducedMotion } from '../lib/motion'
import { Arrow, Icon, Logo, Magnetic, Mark } from '../components/ui'
import { useTheme } from '../lib/store'
import { MeshGradient } from '../components/MeshGradient'
import { api, modelById } from '../api'

/* ============================ Theme toggle ============================ */

export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button className={`theme-toggle ${theme === 'dark' ? 'is-dark' : ''}`} onClick={(e) => toggle(e)} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} data-cursor="hover">
      <span className="tt-track">
        <span className="tt-thumb">
          <svg className="tt-sun" viewBox="0 0 24 24" width="14" height="14" aria-hidden>
            <circle cx="12" cy="12" r="4.5" fill="currentColor" />
            {Array.from({ length: 8 }).map((_, i) => (
              <line key={i} x1="12" y1="2" x2="12" y2="4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" transform={`rotate(${i * 45} 12 12)`} />
            ))}
          </svg>
          <svg className="tt-moon" viewBox="0 0 24 24" width="14" height="14" aria-hidden>
            <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" fill="currentColor" />
          </svg>
        </span>
        <i className="tt-star s1" />
        <i className="tt-star s2" />
        <i className="tt-star s3" />
      </span>
    </button>
  )
}

/* ============================ Preloader ============================ */

export function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = root.current!
    let seen = false
    try {
      seen = sessionStorage.getItem('kwoat4-loaded') === '1'
    } catch {
      /* ignore */
    }
    if (seen || prefersReducedMotion()) {
      el.remove()
      onDone()
      return
    }
    document.documentElement.style.overflow = 'hidden'
    const n = { v: 0 }
    const count = el.querySelector('.pl-n')!
    const tl = gsap.timeline({
      onComplete: () => {
        document.documentElement.style.overflow = ''
        try {
          sessionStorage.setItem('kwoat4-loaded', '1')
        } catch {
          /* ignore */
        }
        el.remove()
      },
    })
    tl.from('.pl-mark .ray', { scaleY: 0, transformOrigin: '48px 84px', duration: 1, ease: 'expo.out', stagger: 0.08 })
      .to(n, { v: 100, duration: 1.8, ease: 'power2.inOut', onUpdate: () => (count.textContent = String(Math.round(n.v))) }, 0)
      .to('.pl-fill', { scaleX: 1, duration: 1.8, ease: 'power2.inOut' }, 0)
      .to('.pl-inner', { scale: 0.9, opacity: 0, duration: 0.5, ease: 'power2.in' }, '+=0.15')
      .to(el, { clipPath: 'circle(0% at 50% 50%)', duration: 1, ease: 'expo.inOut' }, '-=0.1')
      .add(onDone, '-=0.75')
    return () => {
      tl.kill()
      document.documentElement.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div ref={root} className="preloader" aria-hidden>
      <div className="pl-inner">
        <Mark size={72} className="pl-mark" />
        <div className="pl-row">
          <span>Kwoat</span>
          <span>
            <span className="pl-n">0</span>%
          </span>
        </div>
        <div className="pl-bar">
          <i className="pl-fill" />
        </div>
      </div>
    </div>
  )
}

/* ============================ Nav ============================ */

const LINKS = [
  { href: '#how', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#tour', label: 'Product' },
  { href: '#pricing', label: 'Pricing' },
]

export function Nav() {
  const ref = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const el = ref.current!
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (s) => {
        el.classList.toggle('is-scrolled', s.scroll() > 30)
        gsap.to(el, { yPercent: s.direction === 1 && s.scroll() > 600 && !open ? -140 : 0, duration: 0.6, ease: 'kwoat', overwrite: true })
      },
    })
    return () => st.kill()
  }, [open])
  const go = (href: string) => {
    setOpen(false)
    scrollToTarget(href)
  }
  return (
    <header ref={ref} className={`nav ${open ? 'is-open' : ''}`}>
      <div className="nav-bar">
        <Link to="/" aria-label="Kwoat home" className="nav-logo">
          <Logo />
        </Link>
        <nav className="nav-links" aria-label="Main">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => {
                e.preventDefault()
                go(l.href)
              }}
            >
              <span className="roll" data-t={l.label}>
                {l.label}
              </span>
            </a>
          ))}
        </nav>
        <div className="nav-cta">
          <ThemeToggle />
          <Link to="/login" className="nav-login">
            Log in
          </Link>
          <Magnetic to="/signup" className="btn btn-ink btn-sm nav-start">
            Start free <Arrow />
          </Magnetic>
          <button className="icon-btn nav-burger" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
            <Icon name={open ? 'x' : 'menu'} />
          </button>
        </div>
      </div>
      <div className="nav-sheet">
        {LINKS.map((l, i) => (
          <a
            key={l.href}
            href={l.href}
            style={{ transitionDelay: `${open ? 0.1 + i * 0.05 : 0}s` }}
            onClick={(e) => {
              e.preventDefault()
              go(l.href)
            }}
          >
            <small className="mono">0{i + 1}</small>
            {l.label}
          </a>
        ))}
        <Link to="/login" onClick={() => setOpen(false)}>
          <small className="mono">05</small>Log in
        </Link>
      </div>
    </header>
  )
}

/* ============================ Hero ============================ */

/* ============================ Hero ============================ */

const DEMO = [
  'Build a landing page for my bakery',
  'Why does my useEffect run twice?',
  'Analyse this quarter’s revenue numbers',
  'Write a poem for my mum’s birthday',
]
const SCAN = ['gemini-2.5-flash', 'gpt-5.4', 'claude-sonnet-4.6', 'gemini-3.1-pro', 'grok-4.20']

type Phase = 'typing' | 'reading' | 'routing' | 'answer' | 'hold'

/** The app window demo: types a prompt, sends it, routes it, streams the answer, repeats. */
function useDemo(active: boolean) {
  const [n, setN] = useState(0)
  const [phase, setPhase] = useState<Phase>('typing')
  const [typed, setTyped] = useState('')
  const [reply, setReply] = useState('')
  const [scan, setScan] = useState(-1)
  // the previous finished exchange stays visible while the next prompt is typed
  const [prev, setPrev] = useState<{ prompt: string; modelId: string; reason: string; reply: string } | null>(() => {
    const p0 = DEMO[DEMO.length - 1]
    const d0 = api.route(p0)
    return { prompt: p0, modelId: d0.modelId, reason: d0.reason, reply: api.replyFor(d0.modelId) }
  })
  const prompt = DEMO[n % DEMO.length]
  const decision = api.route(prompt)
  const full = api.replyFor(decision.modelId)

  useEffect(() => {
    if (!active) return
    let t: ReturnType<typeof setTimeout>
    if (phase === 'typing') {
      if (typed.length < prompt.length) t = setTimeout(() => setTyped(prompt.slice(0, typed.length + 1)), 32 + Math.random() * 40)
      else t = setTimeout(() => setPhase('reading'), 450)
    } else if (phase === 'reading') {
      t = setTimeout(() => setPhase('routing'), 800)
    } else if (phase === 'routing') {
      const target = SCAN.indexOf(decision.modelId)
      const steps = SCAN.length + Math.max(0, target)
      if (scan < steps) t = setTimeout(() => setScan((x) => x + 1), 110)
      else t = setTimeout(() => setPhase('answer'), 250)
    } else if (phase === 'answer') {
      if (reply.length < full.length) t = setTimeout(() => setReply(full.slice(0, reply.length + 3 + Math.floor(Math.random() * 4))), 26)
      else t = setTimeout(() => setPhase('hold'), 2600)
    } else {
      t = setTimeout(() => {
        setPrev({ prompt, modelId: decision.modelId, reason: decision.reason, reply: full })
        setN((x) => x + 1)
        setTyped('')
        setReply('')
        setScan(-1)
        setPhase('typing')
      }, 400)
    }
    return () => clearTimeout(t)
  }, [active, phase, typed, reply, scan, prompt, full, decision.modelId, decision.reason])

  const target = SCAN.indexOf(decision.modelId)
  const lit = phase === 'routing' ? SCAN[Math.max(0, scan) % SCAN.length] : phase === 'answer' || phase === 'hold' ? decision.modelId : null
  return { prompt, phase, typed, reply, decision, lit, target, prev, sent: phase !== 'typing' }
}

export function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const demo = useDemo(ready)
  const model = modelById(demo.decision.modelId)

  // Entrance
  useEffect(() => {
    if (!ready) return
    const ctx = gsap.context(() => {
      const split = SplitText.create('.hero-h .ln', { type: 'words', wordsClass: 'w', mask: 'words' })
      gsap
        .timeline({ defaults: { ease: 'kwoat' } })
        .from('.hero-mesh', { opacity: 0, duration: 1.6, ease: 'power2.out' }, 0)
        .from('.hero-pill', { y: 16, opacity: 0, filter: 'blur(6px)', duration: 1.1 }, 0.1)
        .from(split.words, { yPercent: 110, duration: 1.3, stagger: 0.07 }, 0.2)
        .from('.hero-sub', { y: 18, opacity: 0, filter: 'blur(6px)', duration: 1.1 }, 0.5)
        .from('.hero-ctas > *', { y: 16, opacity: 0, duration: 1, stagger: 0.08 }, 0.65)
        .from('.hero-proof', { opacity: 0, duration: 1 }, 0.85)
        .from('.hs-window', { y: 120, opacity: 0, duration: 1.6 }, 0.6)
        .from('.hs-float', { y: 50, opacity: 0, scale: 0.92, duration: 1.3, stagger: 0.12 }, 1.1)
        .from('.hero-logos', { opacity: 0, y: 10, duration: 1 }, 1.3)
    }, root)
    return () => ctx.revert()
  }, [ready])

  // Scroll: window settles from tilted to flat; floating cards drift at their own depth
  useEffect(() => {
    const mm = gsap.matchMedia()
    const ctx = gsap.context(() => {
      mm.add('(min-width: 800px)', () => {
        gsap.fromTo('.hs-window', { rotateX: 24, scale: 0.9 }, { rotateX: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.hero-stage', start: 'top 92%', end: 'top 18%', scrub: 0.6 } })
        gsap.utils.toArray<HTMLElement>('.hs-float').forEach((el) => {
          const d = Number(el.dataset.depth || 1)
          gsap.to(el, { y: -120 * d, ease: 'none', scrollTrigger: { trigger: '.hero-stage', start: 'top bottom', end: 'bottom top', scrub: true } })
        })
        gsap.to('.hero-head', { y: -60, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: '40% top', scrub: true } })
      })
    }, root)
    return () => {
      ctx.revert()
      mm.revert()
    }
  }, [])

  // Pointer parallax on the floating cards
  useEffect(() => {
    const el = stage.current
    if (!el || window.matchMedia('(hover: none)').matches) return
    const x = gsap.quickTo(el, '--px', { duration: 0.8, ease: 'power3' })
    const y = gsap.quickTo(el, '--py', { duration: 0.8, ease: 'power3' })
    const move = (e: PointerEvent) => {
      x((e.clientX / window.innerWidth - 0.5) * 2)
      y((e.clientY / window.innerHeight - 0.5) * 2)
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])

  return (
    <section ref={root} className="hero" id="top">
      <MeshGradient className="hero-mesh" />
      <div className="hero-lines" aria-hidden />
      <div className="container hero-head">
        <a
          href="#features"
          className="hero-pill"
          onClick={(e) => {
            e.preventDefault()
            scrollToTarget('#features')
          }}
        >
          <span className="hp-new">New</span>
          Compare four models side by side
          <Icon name="send" size={13} />
        </a>
        <h1 className="hero-h display">
          <span className="ln">Stop choosing.</span>
          <span className="ln grad-text">Start doing.</span>
        </h1>
        <p className="hero-sub lede">One platform for GPT, Claude, Gemini and 10+ more AI models. Kwoat routes every prompt to the model that answers it best — and you only pay for what you use.</p>
        <div className="hero-ctas">
          <Magnetic to="/signup" className="btn btn-primary btn-lg">
            Start for free <Arrow />
          </Magnetic>
          <Magnetic className="btn btn-ghost btn-lg" onClick={() => scrollToTarget('#how')}>
            See how it works
          </Magnetic>
        </div>
        <p className="hero-proof">50 free credits every day · No card needed · Cancel anytime</p>
      </div>

      <div ref={stage} className="container hero-stage">
        <div className="hs-glow" aria-hidden />
        <div className="hs-window" role="img" aria-label="The Kwoat app routing a prompt to the best model">
          <div className="hw-chrome">
            <span />
            <span />
            <span />
            <div className="hw-url mono">kwoat.ai/app</div>
          </div>
          <div className="hw-body">
            <aside className="hw-side">
              <Mark size={20} />
              <span className="hw-new">
                <Icon name="plus" size={15} />
              </span>
              {(['chat', 'compare', 'image', 'rocket', 'mic', 'chart'] as const).map((k, i) => (
                <span key={k} className={`hw-ic ${i === 0 ? 'is-on' : ''}`}>
                  <Icon name={k} size={16} />
                </span>
              ))}
              <span className="hw-av">A</span>
            </aside>
            <div className="hw-main">
              <div className="hw-top">
                <span className="hw-mode">
                  <i /> Auto routing
                </span>
                <div className="hw-credits mono">
                  <span>
                    <i style={{ background: '#8b5cf6' }} />
                    5,495
                  </span>
                  <span>
                    <i style={{ background: '#60a5fa' }} />
                    2,000
                  </span>
                </div>
              </div>
              <div className="hw-thread">
                {!demo.sent && demo.prev && (
                  <>
                    <div className="hw-user">{demo.prev.prompt}</div>
                    <div className="hw-reply">
                      <div className="hw-meta">
                        <Mark size={12} /> <b>{modelById(demo.prev.modelId)?.name}</b>
                        <span>{demo.prev.reason}</span>
                        <em className="mono">{modelById(demo.prev.modelId)?.cost} cr</em>
                      </div>
                      <p>{demo.prev.reply}</p>
                    </div>
                  </>
                )}
                {demo.sent && <div className="hw-user">{demo.prompt}</div>}
                {demo.sent && (
                  <div className="hw-route">
                    <div className="hw-steps">
                      <span className={demo.phase === 'reading' ? 'is-on' : 'is-done'}>
                        {demo.phase === 'reading' ? <span className="spinner" /> : <Icon name="check" size={12} />} Reading prompt
                      </span>
                      {demo.phase !== 'reading' && (
                        <span className={demo.phase === 'routing' ? 'is-on' : 'is-done'}>
                          {demo.phase === 'routing' ? <span className="spinner" /> : <Icon name="check" size={12} />} Choosing model
                        </span>
                      )}
                    </div>
                    {demo.phase !== 'reading' && (
                      <div className="hw-models">
                        {SCAN.map((id) => {
                          const m = modelById(id)!
                          return (
                            <span key={id} className={`hw-model ${demo.lit === id ? 'is-on' : ''}`}>
                              <i style={{ background: m.color }} />
                              {m.name}
                            </span>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
                {(demo.phase === 'answer' || demo.phase === 'hold') && (
                  <div className="hw-reply">
                    <div className="hw-meta">
                      <Mark size={12} /> <b>{model?.name}</b>
                      <span>{demo.decision.reason}</span>
                      <em className="mono">{model?.cost} cr</em>
                    </div>
                    <p>
                      {demo.reply}
                      {demo.phase === 'answer' && <span className="caret" />}
                    </p>
                  </div>
                )}
              </div>
              <div className="hw-composer">
                <span className={demo.typed ? '' : 'hw-ph'}>
                  {demo.sent ? 'Ask anything — the best model is picked for you' : demo.typed || 'Ask anything — the best model is picked for you'}
                  {!demo.sent && demo.typed && <span className="caret" />}
                </span>
                <span className="hw-auto">
                  <i /> Auto
                </span>
                <span className={`hw-send ${!demo.sent && demo.typed.length === demo.prompt.length ? 'is-ready' : ''}`}>
                  <Icon name="send" size={14} />
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="hs-float hs-toast glass" data-depth="1.4" style={{ ['--d' as string]: 1.4 }}>
          <span className="ht-ic">
            <Mark size={14} />
          </span>
          <div>
            <b>Routed to {model?.name}</b>
            <small>Decided in 0.4s · {model?.cost} credits</small>
          </div>
        </div>
        <div className="hs-float hs-compare glass" data-depth="0.8" style={{ ['--d' as string]: 0.8 }}>
          <span className="hf-title">Compare</span>
          {[
            ['Claude Sonnet 4.6', 92, '#f59e0b'],
            ['GPT-5.4', 84, '#10b981'],
            ['Gemini 3.1 Pro', 78, '#06b6d4'],
            ['Grok 4.20', 64, '#ec4899'],
          ].map(([n, v, c]) => (
            <div key={n as string} className="hc-row">
              <span>{n}</span>
              <i>
                <b style={{ width: `${v}%`, background: c as string }} />
              </i>
            </div>
          ))}
        </div>
        <div className="hs-float hs-wallet glass" data-depth="1.1" style={{ ['--d' as string]: 1.1 }}>
          <span className="hf-title">Wallet</span>
          <b className="hw-bal">8,000</b>
          <small>credits · every model</small>
          <svg viewBox="0 0 120 32" aria-hidden>
            <path d="M0 26 C12 24 18 18 30 20 S50 10 62 14 S84 6 96 9 S112 3 120 4" fill="none" stroke="url(#hwg)" strokeWidth="2.5" strokeLinecap="round" />
            <defs>
              <linearGradient id="hwg" x1="0" x2="1">
                <stop offset="0" stopColor="#a78bfa" />
                <stop offset="1" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

    </section>
  )
}
