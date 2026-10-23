import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gsap, SplitText, isTouch, prefersReducedMotion, scrollToTarget } from '../lib/motion'
import { Icon, Magnetic, Mark } from '../components/ui'
import { api, MODELS, modelById } from '../api'

const SUGGEST = [
  { label: 'Fix my code', prompt: 'Debug my code: why does my loop crash?' },
  { label: 'Generate a logo', prompt: 'Generate an image of a minimal violet logo' },
  { label: "Today's news", prompt: "What's the latest news in AI today?" },
  { label: 'Analyse data', prompt: 'Analyse Q2 vs Q3 revenue and spot trends' },
  { label: 'Write a poem', prompt: 'Write a short poem about Lagos at night' },
]
const POOL = MODELS.filter((m) => !m.strengths.includes('video')).slice(0, 11)

export function Hero() {
  const root = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const splits: SplitText[] = []
    const ctx = gsap.context(() => {
      const h = new SplitText('.h5-title .ln', { type: 'words', mask: 'words', wordsClass: 'w' })
      splits.push(h)
      const tl = gsap.timeline({ defaults: { ease: 'kwoat' }, delay: 0.15 })
      tl.fromTo('.h5-pill', { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 })
        .from(h.words, { yPercent: 115, duration: 1.1, stagger: 0.07 }, 0.1)
        .fromTo('.h5-sub, .h5-ctas, .h5-trust', { y: 20, opacity: 0, filter: 'blur(6px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1, stagger: 0.1, clearProps: 'filter' }, 0.55)
        .fromTo('.h5-stage', { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1.4 }, 0.7)
        .fromTo('.h5-float', { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.12, duration: 0.9, ease: 'back.out(1.7)' }, 1.3)

      // The product window lies back in 3D and stands up as you scroll
      gsap.fromTo('.h5-frame', { rotateX: 22, scale: 0.92 }, { rotateX: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.h5-stage', start: 'top 95%', end: 'top 25%', scrub: true } })
      gsap.utils.toArray<HTMLElement>('.h5-float').forEach((el, i) =>
        gsap.to(el, { yPercent: -60 - i * 25, ease: 'none', scrollTrigger: { trigger: '.h5-stage', start: 'top bottom', end: 'bottom top', scrub: true } }),
      )
      gsap.to('.h5-copy', { yPercent: 18, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: '45% top', scrub: true } })
    }, root)
    return () => {
      ctx.revert()
      splits.forEach((s) => s.revert())
    }
  }, [])

  // Pointer spotlight + floating-card parallax
  useEffect(() => {
    const el = root.current
    if (!el || isTouch()) return
    const x = gsap.quickTo(el, '--mx', { duration: 0.6, ease: 'power3' })
    const y = gsap.quickTo(el, '--my', { duration: 0.6, ease: 'power3' })
    const fx = gsap.quickTo(el, '--fx', { duration: 1, ease: 'power3' })
    const fy = gsap.quickTo(el, '--fy', { duration: 1, ease: 'power3' })
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      x(e.clientX - r.left)
      y(e.clientY - r.top)
      fx((e.clientX / innerWidth - 0.5) * 2)
      fy((e.clientY / innerHeight - 0.5) * 2)
    }
    el.addEventListener('pointermove', move)
    return () => el.removeEventListener('pointermove', move)
  }, [])

  return (
    <section ref={root} className="h5" id="top">
      <div className="h5-bg" aria-hidden>
        <div className="h5-grid" />
        <div className="h5-beams">
          {Array.from({ length: 6 }).map((_, i) => (
            <i key={i} style={{ ['--i' as string]: i }} />
          ))}
        </div>
        <div className="h5-cone l" />
        <div className="h5-cone r" />
        <div className="h5-glow" />
      </div>

      <div className="container h5-copy">
        <Link to="/signup" className="h5-pill">
          <span className="h5-pill-new">New</span>
          Missions: AI that does the work
          <Icon name="send" size={13} />
        </Link>
        <h1 className="h5-title">
          <span className="ln">Every AI model.</span>
          <span className="ln grad-text">One platform.</span>
        </h1>
        <p className="h5-sub">
          Stop choosing. Start doing. Kwoat sends every prompt to the best model — GPT, Claude, Gemini, Grok and more — and
          you only pay for what you use.
        </p>
        <div className="h5-ctas">
          <Magnetic to="/signup" className="btn btn-primary btn-lg h5-primary">
            Start free <Icon name="send" size={16} />
          </Magnetic>
          <button className="btn btn-ghost btn-lg" onClick={() => scrollToTarget('#auto')}>
            <span className="h5-play">
              <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden>
                <path d="M7 4v16l13-8Z" fill="currentColor" />
              </svg>
            </span>
            See how it works
          </button>
        </div>
        <ul className="h5-trust">
          <li>
            <Icon name="check" size={15} /> 50 free credits every day
          </li>
          <li>
            <Icon name="check" size={15} /> No card needed
          </li>
          <li>
            <Icon name="check" size={15} /> 13+ models in one place
          </li>
        </ul>
      </div>

      <div className="h5-stage">
        <div className="h5-frame">
          <TryKwoat />
        </div>
        <div className="h5-float f1">
          <span className="dot" style={{ background: '#fbbf24' }} />
          <div>
            <b>Routed to Claude Sonnet 4.6</b>
            <small>Web build → strongest at code</small>
          </div>
        </div>
        <div className="h5-float f2">
          <Icon name="wallet" size={16} />
          <div>
            <b>$12.40</b>
            <small>One wallet · never expires</small>
          </div>
        </div>
        <div className="h5-float f3">
          <span className="h5-faces">
            {['#10b981', '#f59e0b', '#3b82f6', '#ec4899'].map((c) => (
              <i key={c} style={{ background: c }} />
            ))}
          </span>
          <div>
            <b>4 models compared</b>
            <small>GPT-5.4 answered first</small>
          </div>
        </div>
      </div>
    </section>
  )
}

type Phase = 'idle' | 'routing' | 'answer'

/** A miniature Kwoat that visitors can actually type into. */
function TryKwoat() {
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [asked, setAsked] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [scan, setScan] = useState(0)
  const [pick, setPick] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [answer, setAnswer] = useState('')
  const [touched, setTouched] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const box = useRef<HTMLDivElement>(null)

  const clear = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms))

  const run = (q: string) => {
    clear()
    const d = api.route(q)
    setAsked(q)
    setText('')
    setPhase('routing')
    setPick(null)
    setAnswer('')
    setReason(d.reason)
    let n = 0
    const tick = () => {
      setScan(n++ % POOL.length)
      if (n < 14) later(tick, 70 + n * 6)
      else {
        setPick(d.modelId)
        later(() => {
          setPhase('answer')
          const words = api.replyFor(d.modelId).split(' ')
          words.forEach((_, i) => later(() => setAnswer(words.slice(0, i + 1).join(' ')), i * 45))
        }, 550)
      }
    }
    tick()
  }

  // Plays a demo on its own until the visitor types something
  useEffect(() => {
    if (touched) return
    let i = 0
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return clear()
      const loop = () => {
        const s = SUGGEST[i++ % SUGGEST.length].prompt
        let k = 0
        const typeOne = () => {
          setText(s.slice(0, ++k))
          if (k < s.length) later(typeOne, 28)
          else later(() => run(s), 400)
        }
        typeOne()
        later(loop, 9000)
      }
      later(loop, 1400)
    })
    if (box.current) io.observe(box.current)
    return () => {
      io.disconnect()
      clear()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [touched])

  useEffect(() => clear, [])

  const model = modelById(pick ?? undefined)
  return (
    <div ref={box} className="tk">
      <div className="tk-chrome">
        <span className="tk-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="tk-url">
          <Icon name="lock" size={11} /> kwoat.ai/app
        </span>
        <span className="tk-live">
          <span className="dot pulse" /> Live demo — try it
        </span>
      </div>
      <div className="tk-body">
        <aside className="tk-side">
          <span className="tk-logo">
            <Mark size={18} />
          </span>
          <span className="tk-new">
            <Icon name="plus" size={14} /> New chat
          </span>
          {['Missions', 'Compare', 'Gallery', 'Wallet'].map((s, i) => (
            <span key={s} className="tk-nav">
              <Icon name={(['rocket', 'compare', 'image', 'wallet'] as const)[i]} size={14} /> {s}
            </span>
          ))}
          <span className="tk-wallet">
            <Icon name="wallet" size={13} /> $12.40
          </span>
        </aside>
        <div className="tk-main">
          <div className="tk-pool">
            {POOL.map((m, i) => (
              <span key={m.id} className={`${phase === 'routing' && !pick && scan === i ? 'scan' : ''} ${pick === m.id ? 'pick' : ''}`} style={{ ['--c' as string]: m.color }}>
                <i />
                {m.name}
              </span>
            ))}
          </div>
          <div className="tk-thread">
            {phase === 'idle' ? (
              <div className="tk-hello">
                <span className="tk-hello-mark">
                  <Mark size={26} />
                </span>
                <b>What are we working on?</b>
                <small>Type anything — Kwoat picks the best model.</small>
              </div>
            ) : (
              <>
                <div className="tk-user">{asked}</div>
                <div className="tk-bot">
                  <div className="tk-bot-head">
                    <span className="tk-av" style={{ ['--c' as string]: model?.color ?? '#8b5cf6' }}>
                      <Mark size={12} color="#fff" />
                    </span>
                    {model ? (
                      <>
                        <b>{model.name}</b>
                        <em>{reason}</em>
                      </>
                    ) : (
                      <b className="tk-thinking">Choosing the best model…</b>
                    )}
                  </div>
                  {phase === 'answer' && (
                    <p>
                      {answer}
                      <span className="tk-caret" />
                    </p>
                  )}
                  {phase === 'answer' && answer.length > 60 && (
                    <button className="tk-continue" onClick={() => navigate(`/app?prompt=${encodeURIComponent(asked)}`)}>
                      Continue in Kwoat <Icon name="send" size={12} />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
          <form
            className="tk-input"
            onSubmit={(e) => {
              e.preventDefault()
              if (text.trim()) run(text.trim())
            }}
          >
            <input
              value={text}
              placeholder="Ask anything — best model selected automatically…"
              onFocus={() => {
                if (!touched) {
                  clear()
                  setTouched(true)
                  setText('')
                }
              }}
              onChange={(e) => setText(e.target.value)}
              aria-label="Try a prompt"
            />
            <button type="submit" aria-label="Send" disabled={!text.trim()}>
              <Icon name="arrowUp" size={16} />
            </button>
          </form>
          <div className="tk-sugs">
            {SUGGEST.map((s) => (
              <button
                key={s.label}
                onClick={() => {
                  setTouched(true)
                  run(s.prompt)
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
