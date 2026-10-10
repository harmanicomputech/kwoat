import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap, ScrollTrigger, SplitText } from '../lib/motion'
import { HeroScene } from './HeroScene'
import { Arrow, Icon, Magnetic } from '../components/ui'
import { useTypewriter } from '../lib/hooks'
import { api, modelById } from '../api'

const PROMPTS = [
  'Build a landing page for my coffee brand',
  'Why does my useEffect run twice?',
  'Draw a neon fox in a rainy Tokyo alley',
  'Analyse this quarter’s revenue numbers',
  'Write a poem for my mum’s birthday',
]

const MODES = ['Auto', 'Write', 'Code', 'Analyse', 'Compare', 'Image', 'Mission']

export function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null)
  const progress = useRef(0)
  const [mode, setMode] = useState('Auto')
  const [value, setValue] = useState('')
  const { text, index } = useTypewriter(PROMPTS)
  const navigate = useNavigate()
  const decision = api.route(PROMPTS[index])
  const routed = modelById(decision.modelId)

  // Entrance — waits for the preloader
  useEffect(() => {
    if (!ready) return
    const ctx = gsap.context(() => {
      const lines = SplitText.create('.hero-title .line-inner', { type: 'chars', charsClass: 'ch' })
      const tl = gsap.timeline({ defaults: { ease: 'kwoat' } })
      tl.from('.hero-badge', { y: 30, opacity: 0, duration: 1 })
        .from(lines.chars, { yPercent: 120, rotate: 12, opacity: 0, stagger: 0.025, duration: 1.2 }, 0.1)
        .from('.hero-sub', { y: 30, opacity: 0, duration: 1 }, 0.6)
        .from('.hero-box', { y: 60, opacity: 0, scale: 0.94, duration: 1.3 }, 0.7)
        .from('.hero-ctas > *', { y: 20, opacity: 0, stagger: 0.1, duration: 0.9 }, 0.9)
        .from('.hero-scene', { opacity: 0, scale: 1.2, duration: 2.2 }, 0)
        .from('.hero-scroll', { opacity: 0, duration: 1 }, 1.4)
    }, root)
    return () => ctx.revert()
  }, [ready])

  // Scroll: scene swells, copy lifts away
  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (s) => {
          progress.current = s.progress
        },
      })
      gsap.to('.hero-copy', {
        yPercent: -35,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: '70% top', scrub: true },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = value.trim() || PROMPTS[index]
    navigate(`/signup?prompt=${encodeURIComponent(q)}`)
  }

  return (
    <section ref={root} className="hero" id="top">
      <HeroScene progress={progress} />
      <div className="hero-vignette" />
      <div className="container hero-copy">
        <div className="hero-badge chip">
          <span className="dot pulse" style={{ color: 'var(--lime)', background: 'var(--lime)' }} />
          Now in public beta · free to start
        </div>
        <h1 className="hero-title">
          <span className="line">
            <span className="line-inner">Stop choosing.</span>
          </span>
          <span className="line">
            <span className="line-inner">
              Start <em className="serif grad-text">doing.</em>
            </span>
          </span>
        </h1>
        <p className="hero-sub">
          One platform for GPT, Claude, Gemini and 10+ more AI models. Kwoat auto-routes every prompt to the right model — you
          pay only for what you use.
        </p>

        <form className="hero-box" onSubmit={submit} data-cursor="hover">
          <div className="hero-box-glow" />
          <div className="hero-box-top">
            <input
              aria-label="Ask anything"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={text}
            />
            <button type="submit" className="send-btn" aria-label="Send">
              <Icon name="send" />
            </button>
          </div>
          <div className="hero-box-bottom">
            <div className="mode-tabs" role="tablist">
              {MODES.map((m) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === m}
                  key={m}
                  className={mode === m ? 'is-active' : ''}
                  onClick={() => setMode(m)}
                >
                  {m}
                </button>
              ))}
            </div>
            {routed && (
              <div className="route-pill" key={routed.id}>
                <span className="dot" style={{ background: routed.color }} />
                <span className="route-to">→ {routed.name}</span>
              </div>
            )}
          </div>
        </form>

        <div className="hero-ctas">
          <Magnetic to="/signup">
            Start free <Arrow />
          </Magnetic>
          <Magnetic href="#features" className="btn btn-ghost">
            See it in action
          </Magnetic>
          <span className="hero-note">No card needed · 50 free credits every day</span>
        </div>
      </div>
      <div className="hero-scroll" aria-hidden>
        <span>Scroll</span>
        <i />
      </div>
    </section>
  )
}
