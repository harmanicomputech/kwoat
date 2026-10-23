import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from '../lib/motion'
import { Icon } from '../components/ui'

const FAQ: [string, string][] = [
  ['What is Kwoat?', 'One app for every major AI model — GPT, Claude, Gemini, Grok, Llama, Mistral, FLUX and more. Auto mode picks the best one for each prompt, or you choose yourself.'],
  ['Is it really free to start?', 'Yes. You get 50 free credits every day with no card needed. Light chats cost about 1 credit each.'],
  ['How does the wallet work?', 'Top up any amount and pay only for what you use. Your balance never expires, and it covers any overage on paid plans so you are never blocked mid-conversation.'],
  ['Can I choose the model myself?', 'Any time. Pick a model from the menu next to the prompt box, compare four side by side, or set a default in Settings.'],
  ['Do you support African payment methods?', 'All major international cards, Apple Pay and Google Pay work today, including cards issued in Nigeria, Ghana, Kenya and South Africa. Billing is in USD.'],
  ['Can I cancel anytime?', 'Yes — one click, no lock-in. Your plan runs to the end of the billing period and your wallet stays yours.'],
]

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="fq5 sec5" id="faq">
      <div className="container fq5-grid">
        <div className="fq5-side">
          <span className="kick5" data-reveal>
            <Icon name="alert" size={14} /> FAQ
          </span>
          <h2 data-split>Questions, answered.</h2>
          <p data-reveal>
            Something else? <a href="mailto:support@kwoat.ai">Email support@kwoat.ai</a> — we usually reply within a few hours.
          </p>
        </div>
        <div className="fq5-list" data-reveal>
          {FAQ.map(([q, a], i) => (
            <FaqItem key={q} q={q} a={a} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  const body = useRef<HTMLDivElement>(null)
  const first = useRef(true)
  useLayoutEffect(() => {
    if (!body.current) return
    if (first.current) {
      first.current = false
      gsap.set(body.current, { height: open ? 'auto' : 0 })
      return
    }
    gsap.to(body.current, { height: open ? 'auto' : 0, duration: 0.55, ease: 'kwoat' })
  }, [open])
  return (
    <div className={`fq5-item ${open ? 'open' : ''}`}>
      <button onClick={onToggle} aria-expanded={open}>
        {q}
        <span className="fq5-ico">
          <Icon name="plus" size={15} />
        </span>
      </button>
      <div ref={body} className="fq5-body">
        <p>{a}</p>
      </div>
    </div>
  )
}
