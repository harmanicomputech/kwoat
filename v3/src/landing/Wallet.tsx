import { useEffect, useRef } from 'react'
import { gsap } from '../lib/motion'
import { Mark } from '../components/ui'

const SUBS = [
  { n: 'Chat assistant', v: 'OpenAI', p: 20 },
  { n: 'Writing assistant', v: 'Anthropic', p: 20 },
  { n: 'Research assistant', v: 'Google', p: 20 },
  { n: 'Live-news assistant', v: 'xAI', p: 30 },
  { n: 'Image generator', v: 'Image app', p: 10 },
]
const LEDGER = [
  ['Poem for Mum', 'Gemini 2.5 Flash', 1],
  ['Fix auth bug', 'GPT-5.4', 6],
  ['Bakery landing page', 'Claude Sonnet 4.6', 6],
  ['Logo concepts ×4', 'FLUX.2 Klein', 16],
]
const COPY = [
  { k: 'Before', h: 'Five tabs. Five bills.', p: 'A plan for every lab, each one billing you whether you used it this month or not — and you still pick the model yourself.' },
  { k: 'With Kwoat', h: 'One wallet.', p: 'Every model draws from the same balance. 50 free credits a day, then top up or choose a plan. Credits never expire.' },
  { k: 'Every reply', h: 'Priced to the credit.', p: 'Each answer shows exactly what it cost and which model produced it. No surprise bill at the end of the month.' },
]

/** Pinned story: a fan of subscriptions collapses into one Kwoat wallet, then the ledger prints out. */
export function Wallet() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const mm = gsap.matchMedia()
    const ctx = gsap.context(() => {
      const build = (pinned: boolean) => {
        // spread the subscription cards into a fan before recording the timeline
        gsap.set('.wl-sub', { x: (i) => (i - 2) * 46, y: (i) => Math.abs(i - 2) * 16, rotate: (i) => (i - 2) * 7 })
        const tl = gsap.timeline({
          defaults: { ease: 'power2.inOut' },
          scrollTrigger: pinned
            ? { trigger: root.current, start: 'top top', end: '+=2200', pin: true, scrub: 0.8 }
            : { trigger: '.wl-visual', start: 'top 70%', end: 'bottom 20%', scrub: 0.8 },
        })
        tl.from('.wl-sub', { yPercent: 40, opacity: 0, stagger: 0.08, duration: 0.6 })
          .from('.wl-total', { opacity: 0, y: 10, duration: 0.3 }, '<0.3')
          .addLabel('a', '+=0.4')
          // collapse
          .to('.wl-sub', { x: 0, y: 0, rotate: 0, scale: 0.9, opacity: 0, duration: 1, stagger: 0.05 }, 'a')
          .to('.wl-total', { opacity: 0, y: -10, duration: 0.4 }, 'a')
          .to('.wl-copy-0', { opacity: 0, y: -20, duration: 0.4 }, 'a')
          .fromTo('.wl-card', { opacity: 0, scale: 0.8, rotateX: 30 }, { opacity: 1, scale: 1, rotateX: 0, duration: 1 }, 'a+=0.5')
          .fromTo('.wl-copy-1', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, 'a+=0.7')
          .addLabel('b', '+=0.5')
          .to('.wl-copy-1', { opacity: 0, y: -20, duration: 0.4 }, 'b')
          .to('.wl-card', { y: -90, scale: 0.9, duration: 0.8 }, 'b')
          .fromTo('.wl-ledger', { opacity: 0, clipPath: 'inset(0 0 100% 0)' }, { opacity: 1, clipPath: 'inset(0 0 0% 0)', duration: 0.9 }, 'b+=0.3')
          .from('.wl-line', { opacity: 0, x: -14, stagger: 0.1, duration: 0.4 }, 'b+=0.5')
          .fromTo('.wl-copy-2', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, 'b+=0.4')
          .to({}, { duration: 0.4 })
      }
      mm.add('(min-width: 900px)', () => build(true))
      mm.add('(max-width: 899px)', () => build(false))
    }, root)
    return () => {
      ctx.revert()
      mm.revert()
    }
  }, [])

  return (
    <section ref={root} className="wallet">
      <div className="container wl-grid">
        <div className="wl-copy">
          {COPY.map((c, i) => (
            <div key={c.k} className={`wl-copy-i wl-copy-${i}`}>
              <span className="kicker">{c.k}</span>
              <h2 className="h-lg metal">{c.h}</h2>
              <p className="lede">{c.p}</p>
            </div>
          ))}
        </div>
        <div className="wl-visual">
          <div className="wl-subs">
            {SUBS.map((s) => (
              <div key={s.n} className="wl-sub panel">
                <span className="wl-sub-v mono">{s.v}</span>
                <b>{s.n}</b>
                <span className="wl-sub-p">
                  ${s.p}
                  <small>/mo</small>
                </span>
              </div>
            ))}
            <div className="wl-total mono">≈ $100 / month in typical individual plans</div>
          </div>
          <div className="wl-card">
            <div className="wl-card-top">
              <Mark size={22} />
              <span className="mono">Kwoat wallet</span>
            </div>
            <div className="wl-bal">
              8,000 <small>credits</small>
            </div>
            <div className="wl-card-foot">
              <span>Every model · one balance</span>
              <span className="mono">Pro · $19/mo</span>
            </div>
            <i className="wl-sheen" />
          </div>
          <div className="wl-ledger panel">
            {LEDGER.map(([w, m, c]) => (
              <div key={String(w)} className="wl-line">
                <span>{w}</span>
                <span className="wl-m">{m}</span>
                <span className="mono">−{c} cr</span>
              </div>
            ))}
            <div className="wl-line wl-sum">
              <span>Today</span>
              <span />
              <span className="mono">−29 cr</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
