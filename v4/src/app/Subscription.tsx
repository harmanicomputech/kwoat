import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from '../lib/motion'
import { Icon } from '../components/ui'
import { PLANS } from '../api'
import { useAuth } from '../lib/store'
import { useTilt } from '../lib/hooks'
import { Count, Seg, usePageIn } from './kit'
import { money, useWorkspace } from './workspace'

const KICKER: Record<string, string> = { free: 'Get started', starter: 'Starter', pro: 'Pro', promax: 'Pro Max' }
const TONE: Record<string, string> = { free: 'green', starter: 'blue', pro: 'violet', promax: 'indigo' }
const EXTRA: Record<string, { lead: string; items: string[]; off?: string[] }> = {
  free: { lead: "What's included", items: ['Standard + Advanced AI models', 'Web search, image & video generation', 'Voice input, live mode, compare mode', 'Document downloads', 'No subscription · wallet never expires'] },
  starter: { lead: 'Everything in Free & PayG, plus:', items: ['2,500 credits every month', '5 images /mo included', '3 document downloads /mo', 'Web search included', '2 deep research sessions /mo', 'Standard & Advanced overage covered by wallet', 'Higher rate limits & longer responses'], off: ['Video generation', 'Voice live mode'] },
  pro: { lead: 'Everything in Starter, plus:', items: ['Claude Sonnet & Opus included', '8,000 credits every month', '20 images · 10 docs · 500 searches /mo', '5 deep research sessions /mo', 'Video generation from wallet', '60 min voice live per month', 'Wallet overage — never blocked'] },
  promax: { lead: 'Everything in Pro, plus:', items: ['10 agent missions/month included', '80,000 credits/month (standard, advanced & premium)', '100 images · 50 docs · unlimited searches /mo', '20 deep research sessions /mo', '5 videos included per month', '300 min voice live per month', 'Live sandbox code execution', '$2.50/mission overage — flat rate'] },
}

const FAQ = [
  ['What are credits?', 'Credits are how Kwoat measures AI usage. Lighter models cost about 1 credit per reply; premium models cost more. You always see the cost before and after each reply.'],
  ['What happens when my credits run out?', 'Your wallet takes over automatically, so you are never blocked mid-conversation. With no wallet balance, you can top up or wait for tomorrow’s free credits.'],
  ['Can I cancel anytime?', 'Yes. Cancel from this page in one click — your plan stays active until the end of the billing period.'],
  ['Is my wallet balance safe if I cancel?', 'Yes. Wallet balance never expires and stays yours whether or not you subscribe.'],
  ['Which payment methods are accepted?', 'All major international cards, Apple Pay and Google Pay. Billing is in USD.'],
  ['Do you support African currencies?', 'Cards issued in Nigeria, Ghana, Kenya, South Africa and more work today; your bank converts from USD. Local-currency billing is on the roadmap.'],
  ["What's the difference between a subscription and Pay As You Go?", 'A subscription gives you a monthly pool of credits at a lower price per credit. Pay As You Go charges your wallet only for what you use.'],
  ['When do credits reset?', 'Free credits reset daily at midnight. Subscription credits reset on your monthly billing date.'],
]

export default function Subscription() {
  const { user } = useAuth()
  const ws = useWorkspace()
  const root = usePageIn<HTMLDivElement>()
  const [cycle, setCycle] = useState<'monthly' | 'annual'>('monthly')
  const [faq, setFaq] = useState<number | null>(null)
  const current = user?.plan ?? 'free'
  const pct = ws.creditsLeft / ws.daily.limit

  return (
    <div ref={root} className="kp sub">
      <header className="kp-head reveal">
        <div>
          <h1>Your plan</h1>
          <p>Manage your subscription and billing.</p>
        </div>
        <button className="ks-wallet-chip big" onClick={() => ws.openModal('topup')}>
          <Icon name="wallet" size={14} /> {money(ws.balance)} <small>wallet</small>
        </button>
      </header>

      <div className="k-card sub-now reveal">
        <div className="sub-now-top">
          <span className="sub-now-ico">
            <Icon name="sparkle" size={18} />
          </span>
          <div>
            <b>
              Free <span className="k-badge sm">Free tier</span>
            </b>
            <small>
              {ws.creditsLeft} / {ws.daily.limit} free credits remaining today
            </small>
          </div>
        </div>
        <div className="sub-meter">
          <span>Starter credits</span>
          <b>
            <Count value={ws.creditsLeft} /> / {ws.daily.limit} cr
          </b>
          <i>
            <em style={{ transform: `scaleX(${pct})` }} />
          </i>
        </div>
        <div className="sub-nudge">
          <span>
            <Icon name="bolt" size={14} /> Get 2,500 credits every month — standard &amp; advanced pools
          </span>
          <button className="k-btn primary sm shine">Upgrade to Starter →</button>
        </div>
      </div>

      <div className="sub-cycle reveal">
        <Seg
          value={cycle}
          onChange={setCycle}
          options={[
            { id: 'monthly', label: 'Monthly' },
            {
              id: 'annual',
              label: (
                <>
                  Annual <em className="sub-free">1 month free</em>
                </>
              ),
            },
          ]}
        />
      </div>

      <div className="sub-plans">
        {PLANS.map((p) => (
          <PlanCard key={p.id} id={p.id} name={p.name} tagline={p.tagline} badge={p.badge} price={cycle === 'monthly' ? p.monthly : p.yearly / 12} yearly={p.yearly} monthly={p.monthly} current={current === p.id} cycle={cycle} />
        ))}
      </div>

      <div className="k-card sub-pay reveal">
        <h3>Payment</h3>
        <div className="sub-pay-box">
          <Icon name="card" size={18} />
          <div>
            <b>Cards, Apple Pay, and Google Pay</b>
            <small>USD billing · all major international cards accepted</small>
          </div>
          <span className="sub-pay-brands">
            <i>VISA</i>
            <i>MC</i>
            <i>Pay</i>
            <i>G</i>
          </span>
        </div>
        <p className="sub-secure">
          <Icon name="lock" size={13} /> All payments are encrypted and secure. Cancel anytime — no lock-in. <a href="#refunds">Refund policy</a>
        </p>
      </div>

      <div className="k-card sub-how reveal">
        <h3>How pricing works</h3>
        <div>
          <section>
            <b>Free / Pay As You Go</b>
            <p>Top up your wallet and use any model. Charged per request. Wallet balance never expires.</p>
          </section>
          <section>
            <b>Starter, Pro &amp; Pro Max subscriptions</b>
            <p>A fixed number of credits each month across standard, advanced and (Pro/Pro Max) premium pools. Extra usage draws from your wallet — you are never blocked mid-conversation.</p>
          </section>
          <section>
            <b>Credits vs wallet</b>
            <p>Credits come from your monthly pool. Wallet is your pay-as-you-go balance used for overage or PayG requests. Both work together seamlessly.</p>
          </section>
        </div>
      </div>

      <div className="k-card sub-faq reveal">
        <h3>Frequently asked questions</h3>
        {FAQ.map(([q, a], i) => (
          <FaqItem key={q} q={q} a={a} open={faq === i} onToggle={() => setFaq(faq === i ? null : i)} />
        ))}
      </div>
    </div>
  )
}

function PlanCard({ id, name, tagline, badge, price, monthly, yearly, current, cycle }: { id: string; name: string; tagline: string; badge?: string; price: number; monthly: number; yearly: number; current: boolean; cycle: string }) {
  const ref = useTilt<HTMLDivElement>(4)
  const ws = useWorkspace()
  const ex = EXTRA[id]
  return (
    <div ref={ref} className={`plan reveal tone-${TONE[id]} ${current ? 'current' : ''}`}>
      {current ? (
        <span className="plan-flag ok">
          <Icon name="check" size={11} /> Current plan
        </span>
      ) : (
        badge && <span className="plan-flag">{badge}</span>
      )}
      <small className="plan-kicker">{KICKER[id]}</small>
      <h3>{name}</h3>
      <p className="plan-tag">{tagline}</p>
      <div className="plan-price">
        {monthly === 0 ? (
          <>
            <b className="free">Free to start</b>
            <small>Then wallet-based · no subscription</small>
          </>
        ) : (
          <>
            <b>
              <Count value={price} format={(n) => `$${n.toFixed(2)}`} duration={0.7} />
              <em>/mo</em>
            </b>
            <small>{cycle === 'monthly' ? `or $${yearly.toFixed(2)}/yr · save 1 month` : `billed $${yearly.toFixed(2)} yearly`}</small>
          </>
        )}
      </div>
      {id === 'free' && (
        <div className="plan-note">
          <b>50 free credits daily</b> — no card needed, resets every day. When credits run out, top up your wallet and pay per use.
        </div>
      )}
      <small className="plan-lead">{ex.lead}</small>
      <ul>
        {ex.items.map((f) => (
          <li key={f}>
            <Icon name="check" size={14} /> {f}
          </li>
        ))}
        {ex.off?.map((f) => (
          <li key={f} className="off">
            <Icon name="x" size={14} /> {f}
          </li>
        ))}
      </ul>
      <button className={`k-btn ${current ? 'ghost' : 'primary'} wide ${current ? '' : 'shine'}`} disabled={current} onClick={() => ws.toast(`Checkout for ${name} opens once billing is connected`)}>
        {current ? (
          <>
            <Icon name="check" size={15} /> Current plan
          </>
        ) : (
          <>
            <Icon name="bolt" size={15} /> {id === 'starter' ? 'Get Starter' : `Upgrade to ${name}`}
          </>
        )}
      </button>
    </div>
  )
}

export function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  const body = useRef<HTMLDivElement>(null)
  const first = useRef(true)
  useLayoutEffect(() => {
    if (!body.current) return
    if (first.current) {
      first.current = false
      gsap.set(body.current, { height: open ? 'auto' : 0 })
      return
    }
    gsap.to(body.current, { height: open ? 'auto' : 0, duration: 0.5, ease: 'kwoat' })
  }, [open])
  return (
    <div className={`kfaq ${open ? 'open' : ''}`}>
      <button onClick={onToggle} aria-expanded={open}>
        {q}
        <span className="kfaq-ico">
          <Icon name="plus" size={15} />
        </span>
      </button>
      <div ref={body} className="kfaq-body">
        <p>{a}</p>
      </div>
    </div>
  )
}
