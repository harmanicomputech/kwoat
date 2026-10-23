import { useLayoutEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger } from '../lib/motion'
import { Icon, Mark } from '../components/ui'

// "How it works": the text steps scroll past while the picture beside them
// stays pinned and changes to match the step in view.
const STEPS = [
  { n: '01', title: 'Ask anything', text: 'Write, code, analyse, create images or ask about today’s news — in one prompt box. No model to pick, no tabs to juggle.' },
  { n: '02', title: 'Kwoat picks the model', text: 'Auto mode reads the task and sends it to the model that is best at it. Prefer a favourite? Choose any model yourself, any time.' },
  { n: '03', title: 'Pay only for that answer', text: '50 free credits every day. After that, each answer is paid from one wallet that never expires — or from a plan’s monthly credits.' },
]

export function Steps() {
  const root = useRef<HTMLElement>(null)
  const [step, setStep] = useState(0)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.st5-step').forEach((el, i) =>
        ScrollTrigger.create({ trigger: el, start: 'top 60%', end: 'bottom 60%', onToggle: (s) => s.isActive && setStep(i) }),
      )
      gsap.fromTo('.st5-rail i', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.st5-steps', start: 'top 60%', end: 'bottom 60%', scrub: true } })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="st5 sec5" id="how">
      <div className="container">
        <div className="sec5-head left">
          <span className="kick5" data-reveal>
            <Icon name="bolt" size={14} /> How it works
          </span>
          <h2 data-split>Three steps. Zero guesswork.</h2>
        </div>
        <div className="st5-grid">
          <div className="st5-steps">
            <span className="st5-rail" aria-hidden>
              <i />
            </span>
            {STEPS.map((s, i) => (
              <article key={s.n} className={`st5-step ${i === step ? 'on' : ''}`}>
                <span className="st5-n">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </article>
            ))}
          </div>
          <div className="st5-sticky">
            <div className="st5-visual" data-step={step}>
              <span className="st5-visual-bg" aria-hidden />
              <VisualAsk on={step === 0} />
              <VisualRoute on={step === 1} />
              <VisualPay on={step === 2} />
              <div className="st5-dots">
                {STEPS.map((s, i) => (
                  <i key={s.n} className={i === step ? 'on' : ''} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function VisualAsk({ on }: { on: boolean }) {
  return (
    <div className={`sv5 sv5-ask ${on ? 'on' : ''}`}>
      <div className="sv5-box">
        <span className="sv5-typed">Plan a 3-day trip to Zanzibar on a budget</span>
        <span className="sv5-caret" />
        <div className="sv5-row">
          <span className="sv5-chip">+</span>
          <span className="sv5-chip auto">
            <i /> Auto
          </span>
          <span className="sv5-send">
            <Icon name="arrowUp" size={14} />
          </span>
        </div>
      </div>
      <div className="sv5-tags">
        {['Write', 'Code', 'Analyse', 'Image', 'Research', 'Voice'].map((t, i) => (
          <span key={t} style={{ ['--i' as string]: i }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

function VisualRoute({ on }: { on: boolean }) {
  const models = [
    { n: 'GPT-5.4', c: '#10b981' },
    { n: 'Claude', c: '#f59e0b' },
    { n: 'Gemini', c: '#3b82f6' },
    { n: 'Grok', c: '#ec4899' },
    { n: 'Llama', c: '#60a5fa' },
    { n: 'Mistral', c: '#fb923c' },
  ]
  return (
    <div className={`sv5 sv5-route ${on ? 'on' : ''}`}>
      <div className="sv5-orbit">
        {models.map((m, i) => (
          <span key={m.n} className={i === 2 ? 'win' : ''} style={{ ['--a' as string]: `${i * 60}deg`, ['--c' as string]: m.c }}>
            {m.n}
          </span>
        ))}
        <span className="sv5-core">
          <Mark size={30} />
        </span>
        <span className="sv5-sweep" />
      </div>
      <div className="sv5-pick">
        <span className="dot" style={{ background: '#3b82f6' }} /> Gemini 3.1 Pro · travel planning → long-context reasoning
      </div>
    </div>
  )
}

function VisualPay({ on }: { on: boolean }) {
  return (
    <div className={`sv5 sv5-pay ${on ? 'on' : ''}`}>
      <div className="sv5-wallet">
        <span className="sv5-wallet-holo" />
        <small>Wallet</small>
        <b>$12.35</b>
        <span className="sv5-minus">− $0.05</span>
      </div>
      <ul className="sv5-ledger">
        <li>
          <span className="dot" style={{ background: '#3b82f6' }} /> Trip plan · Gemini 3.1 Pro <em>5 cr</em>
        </li>
        <li>
          <span className="dot" style={{ background: '#e879f9' }} /> Beach poster · FLUX.2 <em>4 cr</em>
        </li>
        <li>
          <span className="dot" style={{ background: '#4ade80' }} /> Packing list · GPT-4o Mini <em>Free</em>
        </li>
      </ul>
    </div>
  )
}
