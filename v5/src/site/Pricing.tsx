import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/ui'
import { PLANS } from '../api'
import { Count, Seg } from '../app/kit'
import { useTilt } from '../lib/hooks'

const KICK: Record<string, string> = { free: 'Get started', starter: 'Starter', pro: 'Pro', promax: 'Pro Max' }
const MONTHLY_CREDITS: Record<string, number> = { starter: 2500, pro: 8000, promax: 80000 }

export function Pricing() {
  const [cycle, setCycle] = useState<'monthly' | 'annual'>('monthly')
  return (
    <section className="pr5 sec5" id="pricing">
      <div className="container">
        <div className="sec5-head">
          <span className="kick5" data-reveal>
            <Icon name="wallet" size={14} /> Pricing
          </span>
          <h2 data-split>Start free. Pay as you grow.</h2>
          <p data-reveal>50 free credits every day, no card needed. Upgrade for monthly credits — or simply top up your wallet.</p>
          <div data-reveal>
            <Seg
              value={cycle}
              onChange={setCycle}
              options={[
                { id: 'monthly', label: 'Monthly' },
                {
                  id: 'annual',
                  label: (
                    <>
                      Annual <em className="pr5-save">1 month free</em>
                    </>
                  ),
                },
              ]}
            />
          </div>
        </div>
        <div className="pr5-grid">
          {PLANS.map((p) => (
            <Plan key={p.id} id={p.id} name={p.name} tagline={p.tagline} badge={p.badge} features={p.features} cta={p.cta} price={cycle === 'monthly' ? p.monthly : p.yearly / 12} yearly={p.yearly} cycle={cycle} />
          ))}
        </div>
        <Calculator />
      </div>
    </section>
  )
}

function Plan({ id, name, tagline, badge, features, cta, price, yearly, cycle }: { id: string; name: string; tagline: string; badge?: string; features: string[]; cta: string; price: number; yearly: number; cycle: string }) {
  const ref = useTilt<HTMLDivElement>(4)
  const featured = id === 'pro'
  return (
    <div ref={ref} className={`pr5-card ${featured ? 'featured' : ''} p-${id}`} data-reveal>
      {featured && <span className="pr5-border" aria-hidden />}
      {badge && <span className="pr5-badge">{badge}</span>}
      <small className="pr5-kick">{KICK[id]}</small>
      <h3>{name}</h3>
      <p className="pr5-tag">{tagline}</p>
      <div className="pr5-price">
        {price === 0 ? (
          <b>Free</b>
        ) : (
          <b>
            <Count value={price} format={(n) => `$${n.toFixed(2)}`} duration={0.7} />
            <em>/mo</em>
          </b>
        )}
        <small>{price === 0 ? 'Then pay as you go from your wallet' : cycle === 'monthly' ? `or $${yearly.toFixed(2)}/yr · save 1 month` : `billed $${yearly.toFixed(2)} yearly`}</small>
      </div>
      <Link to="/signup" className={`btn ${featured ? 'btn-primary' : 'btn-ghost'} pr5-cta`}>
        {cta}
      </Link>
      <ul>
        {features.map((f) => (
          <li key={f}>
            <Icon name="check" size={14} /> {f}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Drag to estimate a month: shows the pay-as-you-go cost and the cheapest plan that covers it. */
function Calculator() {
  const [per, setPer] = useState(60)
  const month = per * 30
  const free = 50 * 30
  const payg = Math.max(0, month - free) * 0.01
  const best = month <= free ? null : month - free <= 699 ? null : (['starter', 'pro', 'promax'] as const).find((k) => MONTHLY_CREDITS[k] >= month)
  const planPrice = best ? PLANS.find((p) => p.id === best)!.monthly : 0
  return (
    <div className="pr5-calc" data-reveal>
      <div className="pr5-calc-copy">
        <span className="kick5">
          <Icon name="chart" size={14} /> Estimate your month
        </span>
        <h3>How much would I pay?</h3>
        <p>Drag to match how much you use AI. Light chats cost about 1 credit; premium models and images cost more.</p>
      </div>
      <div className="pr5-calc-ui">
        <label>
          <span>
            Credits per day <b>{per}</b>
          </span>
          <input type="range" min={10} max={400} step={5} value={per} onChange={(e) => setPer(+e.target.value)} style={{ ['--v' as string]: `${((per - 10) / 390) * 100}%` }} />
        </label>
        <div className="pr5-calc-out">
          <div>
            <small>Pay as you go</small>
            <b>
              <Count value={payg} format={(n) => `$${n.toFixed(2)}`} duration={0.4} />
            </b>
            <em>per month, after 1,500 free credits</em>
          </div>
          <div className={best && planPrice < payg ? 'win' : ''}>
            <small>Best plan</small>
            <b>{best ? PLANS.find((p) => p.id === best)!.name : 'Free'}</b>
            <em>{best ? `$${planPrice}/mo · ${MONTHLY_CREDITS[best].toLocaleString()} credits` : 'Free credits cover you'}</em>
          </div>
        </div>
      </div>
    </div>
  )
}
