import { useEffect, useState } from 'react'
import { Icon, Mark } from '../components/ui'
import { useTilt } from '../lib/hooks'
import { Count, Empty, Seg, timeAgo, usePageIn } from './kit'
import { CREDIT_PRICE, money, useWorkspace } from './workspace'
import { MODELS } from '../api'

type Tab = 'overview' | 'credits' | 'transactions'

export default function Wallet() {
  const ws = useWorkspace()
  const [tab, setTab] = useState<Tab>('overview')
  const root = usePageIn<HTMLDivElement>()
  const topups = ws.txns.filter((t) => t.kind === 'topup')
  const spent = ws.txns.filter((t) => t.kind === 'spend').reduce((a, t) => a + t.amount, 0)

  return (
    <div ref={root} className="kp">
      <header className="kp-head reveal">
        <h1>Wallet</h1>
      </header>
      <div className="reveal">
        <Seg<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { id: 'overview', label: 'Overview' },
            { id: 'credits', label: 'Credits' },
            { id: 'transactions', label: 'Transactions' },
          ]}
        />
      </div>

      <div key={tab} className="kw-panel">
        {tab === 'overview' && (
          <>
            <div className="k-stats three">
              <StatCard label="Current Balance" icon="wallet" tone="green" value={ws.balance} sub="Wallet balance" />
              <StatCard label="Total Top-ups" icon="arrowUp" tone="blue" value={topups.reduce((a, t) => a + t.amount, 0)} sub={`${topups.length} transaction(s)`} plain />
              <StatCard label="Total Spent" icon="arrowDown" tone="orange" value={spent} sub="On AI services" />
            </div>
            <div className="kw-add k-card">
              <div className="kw-add-copy">
                <h2>Add funds</h2>
                <p>Cards, Apple Pay, and Google Pay supported</p>
                <div className="kw-methods">
                  <span>
                    <Icon name="card" size={14} /> Card
                  </span>
                  <span>Apple Pay</span>
                  <span>Google Pay</span>
                </div>
                <button className="k-btn primary wide lg shine" onClick={() => ws.openModal('topup')}>
                  Add funds
                </button>
              </div>
              <WalletCard balance={ws.balance} />
            </div>
          </>
        )}
        {tab === 'credits' && <Credits />}
        {tab === 'transactions' && (
          <div className="k-card kw-txns">
            {ws.txns.length ? (
              ws.txns.map((t) => (
                <div key={t.id} className="kw-txn">
                  <span className={`kw-txn-ico ${t.kind}`}>
                    <Icon name={t.kind === 'topup' ? 'arrowUp' : 'bolt'} size={16} />
                  </span>
                  <div>
                    <b>{t.label}</b>
                    <small>{timeAgo(t.at)}</small>
                  </div>
                  <em className={t.kind}>
                    {t.kind === 'topup' ? '+' : '−'}
                    {money(t.amount)}
                  </em>
                </div>
              ))
            ) : (
              <Empty icon="history" title="No transactions yet" text="Top-ups and wallet charges will appear here.">
                <button className="k-btn primary" onClick={() => ws.openModal('topup')}>
                  Add funds
                </button>
              </Empty>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function StatCard({ label, icon, tone, value, sub, plain, format }: { label: string; icon: Parameters<typeof Icon>[0]['name']; tone: string; value: number | string; sub: string; plain?: boolean; format?: (n: number) => string }) {
  const ref = useTilt<HTMLDivElement>(5)
  return (
    <div ref={ref} className={`k-stat tone-${tone} ${plain ? 'plain' : ''}`}>
      <span className="k-stat-glow" aria-hidden />
      <header>
        <span>{label}</span>
        <span className="k-stat-ico">
          <Icon name={icon} size={17} />
        </span>
      </header>
      <b>{typeof value === 'number' ? <Count value={value} format={format ?? ((n) => money(n))} /> : value}</b>
      <small>{sub}</small>
    </div>
  )
}

/** A tilting, holographic virtual card showing the live balance. */
function WalletCard({ balance }: { balance: number }) {
  const ref = useTilt<HTMLDivElement>(14)
  return (
    <div className="kw-card-wrap">
      <div ref={ref} className="kw-card">
        <span className="kw-card-holo" aria-hidden />
        <span className="kw-card-orbs" aria-hidden>
          <i />
          <i />
        </span>
        <div className="kw-card-top">
          <span className="kw-card-logo">
            <Mark size={22} color="#fff" /> Kwoat
          </span>
          <span className="kw-chip" aria-hidden />
        </div>
        <small>Wallet balance</small>
        <b>
          <Count value={balance} format={(n) => money(n)} />
        </b>
        <div className="kw-card-foot">
          <span>•••• 2026</span>
          <span>Never expires</span>
        </div>
      </div>
    </div>
  )
}

function Credits() {
  const ws = useWorkspace()
  const [left, setLeft] = useState(msToMidnight())
  useEffect(() => {
    const t = setInterval(() => setLeft(msToMidnight()), 1000)
    return () => clearInterval(t)
  }, [])
  const pct = ws.creditsLeft / ws.daily.limit
  const h = Math.floor(left / 36e5)
  const m = Math.floor((left % 36e5) / 6e4)
  const s = Math.floor((left % 6e4) / 1000)
  return (
    <div className="kw-credits">
      <div className="k-card kw-ring-card">
        <svg viewBox="0 0 120 120" className="kw-ring">
          <defs>
            <linearGradient id="wlg" x1="0" x2="1">
              <stop offset="0" stopColor="#7c3aed" />
              <stop offset="1" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r="50" />
          <circle cx="60" cy="60" r="50" className="v" style={{ strokeDashoffset: 314 * (1 - pct) }} />
        </svg>
        <div className="kw-ring-txt">
          <b>
            <Count value={ws.creditsLeft} />
          </b>
          <small>of {ws.daily.limit} free today</small>
        </div>
        <div className="kw-reset">
          <span>Resets in</span>
          <b className="mono">
            {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
          </b>
        </div>
      </div>
      <div className="k-card kw-rates">
        <h3>What a credit buys</h3>
        <p>1 credit = {money(CREDIT_PRICE)} from your wallet once today's free credits are used.</p>
        {MODELS.filter((m) => !m.strengths.includes('video')).map((m) => (
          <div key={m.id} className="kw-rate">
            <span className="dot" style={{ background: m.color }} />
            <span>{m.name}</span>
            <em className={`tier ${m.tier}`}>{m.tier}</em>
            <span className="kw-rate-bar">
              <i style={{ width: `${Math.min(100, m.cost * 6.5)}%`, background: m.color }} />
            </span>
            <b>~{m.cost} cr</b>
          </div>
        ))}
      </div>
    </div>
  )
}

function msToMidnight() {
  const n = new Date()
  const m = new Date(n)
  m.setHours(24, 0, 0, 0)
  return m.getTime() - n.getTime()
}
