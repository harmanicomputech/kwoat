import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap } from '../lib/motion'
import { Icon, type IconName } from '../components/ui'
import { modelById } from '../api'
import { Count, Empty, Seg, timeAgo, usePageIn } from './kit'
import { StatCard } from './Wallet'
import { uid, useWorkspace, type UsageRecord, type UsageType } from './workspace'

const TYPES: { id: UsageType; label: string; icon: IconName; color: string }[] = [
  { id: 'chat', label: 'Chat messages', icon: 'chat', color: '#8b5cf6' },
  { id: 'search', label: 'Web searches', icon: 'search', color: '#06b6d4' },
  { id: 'document', label: 'Documents', icon: 'doc', color: '#f59e0b' },
  { id: 'image', label: 'Images', icon: 'image', color: '#ec4899' },
  { id: 'video', label: 'Videos', icon: 'compare', color: '#f97316' },
]

/** Plausible month of activity, used only by the "preview with sample data" switch. */
function sample(): UsageRecord[] {
  const ids = ['gemini-2.5-flash', 'gpt-5.4', 'claude-sonnet-4.6', 'gemini-3.1-pro', 'flux-2-klein', 'gpt-4o-mini']
  const out: UsageRecord[] = []
  for (let d = 0; d < 30; d++) {
    const n = Math.round(3 + 4 * Math.sin(d / 3) + Math.random() * 5)
    for (let i = 0; i < n; i++) {
      const modelId = ids[Math.floor(Math.random() * ids.length) * (Math.random() < 0.6 ? 0 : 1)] ?? ids[0]
      const m = modelById(modelId)!
      const type: UsageType = m.strengths.includes('images') ? 'image' : Math.random() < 0.15 ? 'search' : Math.random() < 0.06 ? 'document' : 'chat'
      out.push({ id: uid(), at: Date.now() - d * 864e5 - Math.random() * 6e7, modelId, credits: m.cost, tokens: 200 + Math.floor(Math.random() * 1600), type })
    }
  }
  return out
}

export default function Usage() {
  const ws = useWorkspace()
  const root = usePageIn<HTMLDivElement>()
  const [demo, setDemo] = useState(false)
  const [range, setRange] = useState<'7' | '14' | '30'>('7')
  const [tab, setTab] = useState<'all' | 'model' | 'date'>('all')
  const demoData = useMemo(sample, [])
  const usage = demo ? demoData : ws.usage

  const tokens = usage.reduce((a, r) => a + r.tokens, 0)
  const credits = usage.reduce((a, r) => a + r.credits, 0)
  const byModel = new Map<string, { credits: number; n: number; tokens: number }>()
  usage.forEach((r) => {
    const x = byModel.get(r.modelId) ?? { credits: 0, n: 0, tokens: 0 }
    byModel.set(r.modelId, { credits: x.credits + r.credits, n: x.n + 1, tokens: x.tokens + r.tokens })
  })
  const top = [...byModel].sort((a, b) => b[1].n - a[1].n)[0]
  const todayStart = new Date(new Date().toDateString()).getTime()
  const today = usage.filter((r) => r.at >= todayStart)

  return (
    <div ref={root} className="kp">
      <header className="kp-head reveal">
        <div>
          <h1>Usage Analytics</h1>
          <p>Track your AI consumption and spending patterns</p>
        </div>
        <label className="k-switch-row">
          <span>Preview with sample data</span>
          <Switch on={demo} onChange={setDemo} />
        </label>
      </header>

      <div className="k-stats four reveal">
        <StatCard label="Total Tokens" icon="bolt" tone="orange" value={tokens} format={(n) => Math.round(n).toLocaleString()} sub={`Across ${usage.length} requests`} plain />
        <StatCard label="Credits Used" icon="bolt" tone="violet" value={credits} format={(n) => `${Math.round(n).toLocaleString()} credits`} sub={`${ws.creditsLeft} remaining`} plain />
        <StatCard label="Most Used Model" icon="arrowUp" tone="blue" value={top ? (modelById(top[0])?.name ?? top[0]) : 'N/A'} sub={top ? `${top[1].n} requests` : 'No usage yet'} plain />
        <StatCard label="Today" icon="history" tone="violet" value={today.reduce((a, r) => a + r.credits, 0)} format={(n) => `${Math.round(n)} cr`} sub={`${today.length} requests today`} plain />
      </div>

      <div className="us-row reveal">
        <div className="k-card us-chart">
          <header>
            <div>
              <h3>Credits over time</h3>
              <p>Daily usage breakdown</p>
            </div>
            <Seg
              small
              value={range}
              onChange={setRange}
              options={[
                { id: '7', label: '7d' },
                { id: '14', label: '14d' },
                { id: '30', label: '30d' },
              ]}
            />
          </header>
          <Chart usage={usage} days={+range} />
        </div>
        <div className="k-card us-donut-card">
          <header>
            <h3>Usage by type</h3>
            <p>All time</p>
          </header>
          <Donut usage={usage} />
        </div>
      </div>

      <div className="k-card us-features reveal">
        <h3>Feature usage this month</h3>
        <p>Limits reset monthly based on your plan</p>
        <div className="us-feat-grid">
          {TYPES.map((t) => {
            const n = usage.filter((r) => r.type === t.id).length
            return (
              <div key={t.id} className="us-feat" style={{ ['--c' as string]: t.color }}>
                <span className="us-feat-ico">
                  <Icon name={t.icon} size={17} />
                </span>
                <div>
                  <small>{t.label}</small>
                  <b>
                    <Count value={n} />
                    {t.id === 'search' && <em> N/A</em>}
                  </b>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="reveal">
        <Seg
          value={tab}
          onChange={setTab}
          options={[
            { id: 'all', label: 'All Usage' },
            { id: 'model', label: 'By Model' },
            { id: 'date', label: 'By Date' },
          ]}
        />
      </div>
      <div className="k-card us-history reveal">
        <h2>Usage History</h2>
        <p>Detailed breakdown of all your AI requests</p>
        {!usage.length ? (
          <Empty icon="wave" title="No usage yet" text="Start using AI models to see your usage analytics here" />
        ) : tab === 'model' ? (
          <div className="us-table">
            {[...byModel]
              .sort((a, b) => b[1].credits - a[1].credits)
              .map(([id, v]) => {
                const m = modelById(id)
                return (
                  <div key={id} className="us-tr">
                    <span className="dot" style={{ background: m?.color }} />
                    <b>{m?.name}</b>
                    <span className="us-bar">
                      <i style={{ width: `${(v.credits / credits) * 100}%`, background: m?.color }} />
                    </span>
                    <span>{v.n} req</span>
                    <em>{v.credits} cr</em>
                  </div>
                )
              })}
          </div>
        ) : tab === 'date' ? (
          <div className="us-table">
            {days(usage, 14)
              .filter((d) => d.n)
              .reverse()
              .map((d) => (
                <div key={d.label} className="us-tr">
                  <Icon name="history" size={15} />
                  <b>{d.label}</b>
                  <span className="us-bar">
                    <i style={{ width: `${Math.min(100, d.credits * 2)}%` }} />
                  </span>
                  <span>{d.n} req</span>
                  <em>{d.credits} cr</em>
                </div>
              ))}
          </div>
        ) : (
          <div className="us-table">
            {usage.slice(0, 12).map((r) => {
              const m = modelById(r.modelId)
              return (
                <div key={r.id} className="us-tr">
                  <span className="dot" style={{ background: m?.color }} />
                  <b>{m?.name}</b>
                  <span className="us-type">{r.type}</span>
                  <span>{r.tokens.toLocaleString()} tokens</span>
                  <em>{r.credits} cr</em>
                  <small>{timeAgo(r.at)}</small>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function days(usage: UsageRecord[], n: number) {
  const out: { label: string; credits: number; n: number }[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 864e5)
    const start = new Date(d.toDateString()).getTime()
    const list = usage.filter((r) => r.at >= start && r.at < start + 864e5)
    out.push({ label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), credits: list.reduce((a, r) => a + r.credits, 0), n: list.length })
  }
  return out
}

function Chart({ usage, days: n }: { usage: UsageRecord[]; days: number }) {
  const ref = useRef<SVGSVGElement>(null)
  const [hover, setHover] = useState<number | null>(null)
  const data = days(usage, n)
  const max = Math.max(1, ...data.map((d) => d.credits))
  const W = 640
  const H = 200
  const x = (i: number) => 40 + (i / Math.max(1, n - 1)) * (W - 60)
  const y = (v: number) => H - 24 - (v / max) * (H - 50)
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d.credits)}`).join(' ')
  const area = `${line} L${x(n - 1)},${H - 24} L${x(0)},${H - 24} Z`

  useLayoutEffect(() => {
    if (!ref.current) return
    gsap.fromTo(ref.current.querySelector('.us-line'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.4, ease: 'kwoat' })
    gsap.fromTo(ref.current.querySelector('.us-area'), { opacity: 0, scaleY: 0, transformOrigin: '50% 100%' }, { opacity: 1, scaleY: 1, duration: 1.2, ease: 'kwoat' })
    gsap.fromTo(ref.current.querySelectorAll('.us-pt'), { scale: 0, transformOrigin: 'center' }, { scale: 1, stagger: 0.03, duration: 0.5, ease: 'back.out(3)', delay: 0.5 })
  }, [n, usage])

  const ticks = [0, 0.2, 0.4, 0.6, 0.8, 1]
  const every = n > 14 ? 5 : n > 7 ? 2 : 1
  return (
    <div className="us-plot-wrap">
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="us-svg" onPointerLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="usg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--violet)" stopOpacity="0.32" />
            <stop offset="1" stopColor="var(--violet)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1="40" x2={W - 20} y1={y(t * max)} y2={y(t * max)} className="us-grid" />
            <text x="30" y={y(t * max) + 3} textAnchor="end">
              {max === 1 ? t.toFixed(1) : Math.round(t * max)}
            </text>
          </g>
        ))}
        <path d={area} className="us-area" fill="url(#usg)" />
        <path d={line} className="us-line" />
        {data.map((d, i) => (
          <g key={i}>
            <rect x={x(i) - (W - 60) / n / 2} y="0" width={(W - 60) / n} height={H} fill="transparent" onPointerEnter={() => setHover(i)} />
            <circle cx={x(i)} cy={y(d.credits)} r={hover === i ? 5 : 3} className="us-pt" />
            {i % every === 0 && (
              <text x={x(i)} y={H - 6} textAnchor="middle">
                {d.label}
              </text>
            )}
          </g>
        ))}
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1="10" y2={H - 24} className="us-cross" />}
      </svg>
      {hover !== null && (
        <div className="us-tip" style={{ left: `${(x(hover) / W) * 100}%` }}>
          <b>{data[hover].credits} cr</b>
          <small>
            {data[hover].label} · {data[hover].n} requests
          </small>
        </div>
      )}
    </div>
  )
}

function Donut({ usage }: { usage: UsageRecord[] }) {
  const ref = useRef<SVGSVGElement>(null)
  const total = usage.length
  const parts = TYPES.map((t) => ({ ...t, n: usage.filter((r) => r.type === t.id).length })).filter((p) => p.n)
  useLayoutEffect(() => {
    if (ref.current) gsap.from(ref.current.querySelectorAll('.us-arc'), { drawSVG: '0%', stagger: 0.12, duration: 1, ease: 'kwoat' })
  }, [total])
  if (!total)
    return (
      <div className="us-nodata">
        <span className="us-nodata-ring" />
        No data
      </div>
    )
  const C = 2 * Math.PI * 52
  let acc = 0
  return (
    <div className="us-donut">
      <svg ref={ref} viewBox="0 0 140 140">
        {parts.map((p) => {
          const len = (p.n / total) * C
          const el = <circle key={p.id} cx="70" cy="70" r="52" className="us-arc" stroke={p.color} strokeDasharray={`${Math.max(0, len - 3)} ${C}`} strokeDashoffset={-acc} />
          acc += len
          return el
        })}
        <text x="70" y="68" textAnchor="middle" className="us-donut-n">
          {total}
        </text>
        <text x="70" y="86" textAnchor="middle" className="us-donut-l">
          requests
        </text>
      </svg>
      <ul>
        {parts.map((p) => (
          <li key={p.id}>
            <span className="dot" style={{ background: p.color }} /> {p.label}
            <b>{Math.round((p.n / total) * 100)}%</b>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Switch({ on, onChange, disabled }: { on: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={on} disabled={disabled} className={`k-switch ${on ? 'on' : ''}`} onClick={() => onChange(!on)}>
      <i />
    </button>
  )
}
