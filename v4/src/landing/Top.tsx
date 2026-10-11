import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gsap, ScrollTrigger, SplitText, scrollToTarget, prefersReducedMotion } from '../lib/motion'
import { Arrow, Icon, Logo, Magnetic, Mark } from '../components/ui'
import { useTheme } from '../lib/store'
import { useTypewriter } from '../lib/hooks'
import { GlassScene } from './GlassScene'
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

const PROMPTS = ['Build a landing page for my bakery', 'Why does my useEffect run twice?', 'A neon fox in a rainy Tokyo alley', 'Analyse this quarter’s revenue', 'Write a poem for my mum']

export function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null)
  const progress = useRef(0)
  const [value, setValue] = useState('')
  const { text, index } = useTypewriter(PROMPTS, { hold: 2000 })
  const routed = modelById(api.route(PROMPTS[index]).modelId)
  const done = text.length === PROMPTS[index].length
  const navigate = useNavigate()

  useEffect(() => {
    if (!ready) return
    const ctx = gsap.context(() => {
      const split = SplitText.create('.hero-h .ln', { type: 'chars', charsClass: 'ch', mask: 'chars' })
      gsap
        .timeline({ defaults: { ease: 'kwoat' } })
        .from('.hero .eyebrow', { y: 20, opacity: 0, filter: 'blur(8px)', duration: 1.2 }, 0.1)
        .from(split.chars, { yPercent: 110, rotate: 8, duration: 1.4, stagger: 0.022 }, 0.15)
        .from('.hero-sub', { y: 24, opacity: 0, filter: 'blur(8px)', duration: 1.2 }, 0.55)
        .from('.hero-box', { y: 40, opacity: 0, scale: 0.96, filter: 'blur(12px)', duration: 1.4 }, 0.7)
        .from('.hero-ctas > *', { y: 20, opacity: 0, duration: 1, stagger: 0.08 }, 0.9)
        .from('.hero-proof > *', { opacity: 0, y: 10, duration: 1, stagger: 0.06 }, 1.1)
    }, root)
    return () => ctx.revert()
  }, [ready])

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (s) => (progress.current = s.progress),
      })
      gsap.to('.hero-copy', { y: -140, opacity: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: '75% top', scrub: true } })
    }, root)
    return () => ctx.revert()
  }, [])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/signup?prompt=${encodeURIComponent(value.trim() || PROMPTS[index])}`)
  }

  return (
    <section ref={root} className="hero" id="top">
      <GlassScene progress={progress} start={ready} />
      <div className="container hero-copy">
        <span className="eyebrow">Now in public beta · free to start</span>
        <h1 className="hero-h display h-hero">
          <span className="ln">Stop choosing.</span>
          <span className="ln grad-text">Start doing.</span>
        </h1>
        <p className="hero-sub lede">One platform for GPT, Claude, Gemini and 10+ more AI models. Kwoat routes every prompt to the right model — you only pay for what you use.</p>
        <form className="hero-box glass" onSubmit={submit}>
          <div className="hb-row">
            <input value={value} onChange={(e) => setValue(e.target.value)} placeholder={text} aria-label="Ask anything" />
            <button className="hb-send" type="submit" aria-label="Send">
              <Icon name="send" size={18} />
            </button>
          </div>
          <div className="hb-foot">
            <span className="hb-auto">
              <i /> Auto
            </span>
            <span className={`hb-route ${done ? 'is-on' : ''}`}>
              → <b style={{ color: routed?.color }}>●</b> {routed?.name}
            </span>
          </div>
        </form>
        <div className="hero-ctas">
          <Magnetic to="/signup" className="btn btn-primary btn-lg">
            Start for free <Arrow />
          </Magnetic>
          <Magnetic className="btn btn-ghost btn-lg" onClick={() => scrollToTarget("#how")}>
            See how it works
          </Magnetic>
        </div>
        <div className="hero-proof">
          <span>
            <b>50</b> free credits daily
          </span>
          <span>No card needed</span>
          <span>13+ models</span>
        </div>
      </div>
      <div className="hero-scroll" aria-hidden>
        <span />
      </div>
    </section>
  )
}
