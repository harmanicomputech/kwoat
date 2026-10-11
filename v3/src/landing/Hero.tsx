import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from '../lib/motion'
import { Rays } from '../components/Rays'
import { Arrow, Icon, Magnetic } from '../components/ui'
import { useTypewriter } from '../lib/hooks'
import { api, modelById } from '../api'

const PROMPTS = [
  'Build a landing page for my coffee brand',
  'Why does my useEffect run twice?',
  'A neon fox in a rainy Tokyo alley',
  'Analyse this quarter’s revenue',
  'Write a poem for my mum’s birthday',
]
const MODES = ['Auto', 'Write', 'Code', 'Analyse', 'Image', 'Compare']

export function Hero() {
  const root = useRef<HTMLElement>(null)
  const [value, setValue] = useState('')
  const [mode, setMode] = useState('Auto')
  const { text, index } = useTypewriter(PROMPTS, { hold: 2200 })
  const navigate = useNavigate()
  const routed = modelById(api.route(PROMPTS[index]).modelId)
  const typedAll = text.length === PROMPTS[index].length
  const [focal, setFocal] = useState<[number, number]>([0.5, 0.36])
  const [narrow] = useState(() => typeof window !== 'undefined' && window.innerWidth < 700)

  // Aim the rays at the top edge of the prompt box, wherever layout puts it
  useEffect(() => {
    const measure = () => {
      const hero = root.current
      const box = hero?.querySelector<HTMLElement>('.hero-box')
      if (!hero || !box) return
      const h = hero.getBoundingClientRect()
      const b = box.getBoundingClientRect()
      setFocal([(b.left + b.width / 2 - h.left) / h.width, 1 - (b.top - h.top) / h.height])
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (root.current) ro.observe(root.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'kwoat' } })
        .from('.rays', { opacity: 0, duration: 2.4, ease: 'power2.out' }, 0)
        .from('.hero-badge', { y: 12, opacity: 0, filter: 'blur(6px)', duration: 1.2 }, 0.25)
        .from('.hero-title .ln > span', { yPercent: 105, duration: 1.4, stagger: 0.12 }, 0.35)
        .from('.hero-sub', { y: 16, opacity: 0, filter: 'blur(6px)', duration: 1.2 }, 0.7)
        .from('.hero-box', { y: 24, opacity: 0, scale: 0.97, filter: 'blur(10px)', duration: 1.4 }, 0.85)
        .from('.hero-actions > *', { y: 12, opacity: 0, duration: 1, stagger: 0.08 }, 1.05)
    }, root)
    return () => ctx.revert()
  }, [])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/signup?prompt=${encodeURIComponent(value.trim() || PROMPTS[index])}`)
  }

  return (
    <section ref={root} className="hero" id="top">
      <Rays focal={focal} intensity={narrow ? 0.5 : 0.72} spread={narrow ? 0.75 : 1} className="hero-rays" />
      <div className="hero-fade" />
      <div className="container hero-inner">
        <a href="#pricing" className="hero-badge">
          <span className="hb-tag">Public beta</span>
          <span>Free to start — 50 credits every day</span>
          <Icon name="send" size={13} />
        </a>
        <h1 className="hero-title h-xl">
          <span className="ln">
            <span className="metal">Stop choosing.</span>
          </span>
          <span className="ln">
            <span className="violet-text">Start doing.</span>
          </span>
        </h1>
        <p className="hero-sub lede">
          GPT, Claude, Gemini, Grok and more — behind one prompt box. Kwoat sends every request to the model that answers it
          best, and shows you exactly what it cost.
        </p>

        <form className="hero-box" onSubmit={submit}>
          <div className="hb-row">
            <input aria-label="Ask anything" value={value} onChange={(e) => setValue(e.target.value)} placeholder={text} />
            <button type="submit" className="hb-send" aria-label="Send">
              <Icon name="send" size={16} />
            </button>
          </div>
          <div className="hb-foot">
            <div className="hb-modes" role="tablist" aria-label="Mode">
              {MODES.map((m) => (
                <button type="button" role="tab" aria-selected={mode === m} key={m} className={mode === m ? 'is-on' : ''} onClick={() => setMode(m)}>
                  {m}
                </button>
              ))}
            </div>
            <div className={`hb-route ${typedAll ? 'is-on' : ''}`} aria-live="polite">
              <span className="hb-route-label">Routing to</span>
              <span className="hb-route-model">
                <i style={{ background: routed?.color }} />
                {routed?.name}
              </span>
            </div>
          </div>
        </form>

        <div className="hero-actions">
          <Magnetic to="/signup" className="btn btn-primary btn-lg">
            Start for free <Arrow />
          </Magnetic>
          <Magnetic href="#product" className="btn btn-ghost btn-lg">
            See the product
          </Magnetic>
        </div>
      </div>
    </section>
  )
}
