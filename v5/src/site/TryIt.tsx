import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap, prefersReducedMotion } from '../lib/motion'
import { Icon, Mark } from '../components/ui'
import { api, MODELS, modelById } from '../api'

// "Try it right here": a miniature Kwoat that visitors can type into. It lies
// back in 3D and stands up as it scrolls into view.
const SUGGEST = [
  { label: 'Fix my code', prompt: 'Debug my code: why does my loop crash?' },
  { label: 'Generate a logo', prompt: 'Generate an image of a minimal violet logo' },
  { label: "Today's news", prompt: "What's the latest news in AI today?" },
  { label: 'Analyse data', prompt: 'Analyse Q2 vs Q3 revenue and spot trends' },
  { label: 'Write a poem', prompt: 'Write a short poem about Lagos at night' },
]
const POOL = MODELS.filter((m) => !m.strengths.includes('video')).slice(0, 11)


export function TryIt() {
  const root = useRef<HTMLElement>(null)
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.ty5-frame', { rotateX: 24, scale: 0.9, y: 40 }, { rotateX: 0, scale: 1, y: 0, ease: 'none', scrollTrigger: { trigger: '.ty5-stage', start: 'top 95%', end: 'top 30%', scrub: true } })
    }, root)
    return () => ctx.revert()
  }, [])
  return (
    <section ref={root} className="ty5 sec5" id="try">
      <div className="container">
        <div className="sec5-head">
          <span className="kick5" data-reveal>
            <span className="dot pulse" /> Live demo
          </span>
          <h2 data-split>Try it right here.</h2>
          <p data-reveal>Type anything, or tap a suggestion — watch Kwoat pick the model and answer.</p>
        </div>
        <div className="ty5-stage">
          <div className="ty5-frame">
            <TryKwoat />
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
