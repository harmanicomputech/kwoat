import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/motion'
import { PLANS } from '../api'
import { Arrow, Icon, Magnetic } from '../components/ui'
import { useSpotlight } from '../lib/hooks'

function Price({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const last = useRef(value)
  useEffect(() => {
    const o = { v: last.current }
    const tween = gsap.to(o, {
      v: value,
      duration: 0.9,
      ease: 'expo.out',
      onUpdate: () => {
        if (ref.current) ref.current.textContent = o.v % 1 === 0 && value % 1 === 0 ? Math.round(o.v).toLocaleString() : o.v.toFixed(2)
      },
    })
    last.current = value
    return () => {
      tween.kill()
    }
  }, [value])
  return <span ref={ref}>{value.toLocaleString()}</span>
}

export function Pricing() {
  const [yearly, setYearly] = useState(false)
  const spot = useSpotlight<HTMLDivElement>()
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.pr-card', {
        y: 100,
        opacity: 0,
        stagger: 0.12,
        duration: 1.2,
        ease: 'kwoat',
        scrollTrigger: { trigger: '.pr-grid', start: 'top 80%' },
      })
      gsap.from('.pr-head > *', {
        y: 40,
        opacity: 0,
        stagger: 0.1,
        duration: 1,
        ease: 'kwoat',
        scrollTrigger: { trigger: root.current, start: 'top 75%' },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="pricing" id="pricing">
      <div className="container">
        <div className="pr-head">
          <span className="eyebrow">Simple pricing</span>
          <h2 className="h2">
            Start free. <em className="serif grad-text">Scale</em> when ready.
          </h2>
          <p className="lede">No surprise bills. See the cost of every response. Cancel anytime.</p>
          <div className="pr-toggle" role="radiogroup" aria-label="Billing period">
            <button role="radio" aria-checked={!yearly} className={!yearly ? 'is-on' : ''} onClick={() => setYearly(false)}>
              Monthly
            </button>
            <button role="radio" aria-checked={yearly} className={yearly ? 'is-on' : ''} onClick={() => setYearly(true)}>
              Yearly <small>1 month free</small>
            </button>
            <i style={{ transform: `translateX(${yearly ? 100 : 0}%)` }} />
          </div>
        </div>

        <div ref={spot} className="pr-grid">
          {PLANS.map((p) => {
            const featured = p.id === 'pro'
            return (
              <article key={p.id} className={`pr-card card spotlight ${featured ? 'is-featured' : ''}`}>
                {p.badge && <span className="pr-badge">{p.badge}</span>}
                <h3>{p.name}</h3>
                <p className="pr-tag">{p.tagline}</p>
                <div className="pr-price">
                  {p.monthly === 0 ? (
                    <span className="pr-free">Free</span>
                  ) : (
                    <>
                      <sup>$</sup>
                      <Price value={yearly ? p.yearly : p.monthly} />
                      <small>/{yearly ? 'yr' : 'mo'}</small>
                    </>
                  )}
                </div>
                <p className="pr-note">{p.monthly === 0 ? 'Then wallet-based · no subscription' : yearly ? `≈ $${(p.yearly / 12).toFixed(2)} / month` : 'Billed monthly'}</p>
                <ul>
                  {p.features.map((f) => (
                    <li key={f}>
                      <Icon name="check" size={16} /> {f}
                    </li>
                  ))}
                </ul>
                <Magnetic to={`/signup?plan=${p.id}`} className={`btn ${featured ? 'btn-primary' : 'btn-ghost'} pr-cta`} strength={0.15}>
                  {p.cta} <Arrow />
                </Magnetic>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
