import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from '../lib/motion'
import { api, modelById, type UsagePoint } from '../api'
import { useAuth } from '../lib/store'

const RANGES = [7, 14, 30] as const

export default function Usage() {
  const { user } = useAuth()
  const [days, setDays] = useState<(typeof RANGES)[number]>(30)
  const [data, setData] = useState<UsagePoint[]>([])
  const [hover, setHover] = useState<number | null>(null)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.usage(days).then(setData)
  }, [days])

  const total = data.reduce((n, d) => n + d.credits, 0)
  const max = Math.max(1, ...data.map((d) => d.credits))
  const byModel = useMemo(() => {
    const acc: Record<string, number> = {}
    data.forEach((d) => Object.entries(d.byModel).forEach(([k, v]) => (acc[k] = (acc[k] ?? 0) + v)))
    return Object.entries(acc).sort((a, b) => b[1] - a[1])
  }, [data])

  useEffect(() => {
    if (!data.length || !root.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo('.bar', { scaleY: 0 }, { scaleY: 1, transformOrigin: 'bottom', duration: 1, ease: 'expo.out', stagger: 0.012 })
      gsap.fromTo('.split-fill', { scaleX: 0 }, { scaleX: 1, transformOrigin: 'left', duration: 1.2, ease: 'expo.out', stagger: 0.07 })
      const o = { v: 0 }
      gsap.to(o, {
        v: total,
        duration: 1.4,
        ease: 'power3.out',
        onUpdate: () => {
          const el = root.current?.querySelector('.kpi-total')
          if (el) el.textContent = Math.round(o.v).toLocaleString('en-US')
        },
      })
    }, root)
    return () => ctx.revert()
  }, [data, total])

  const h = hover !== null ? data[hover] : null

  return (
    <div ref={root} className="page">
      <header className="pg-head">
        <h1 className="display">
          Every credit,
          <br />
          <em>on the record.</em>
        </h1>
        <div className="seg" role="radiogroup" aria-label="Range">
          {RANGES.map((r) => (
            <button key={r} role="radio" aria-checked={days === r} className={days === r ? 'is-on' : ''} onClick={() => setDays(r)}>
              {r}D
            </button>
          ))}
        </div>
      </header>

      <div className="kpis">
        <div>
          <span className="label">Credits used · {days}d</span>
          <b className="display kpi-total">0</b>
        </div>
        <div>
          <span className="label">Wallet</span>
          <b className="display">{user?.credits.standard.toLocaleString('en-US')}</b>
        </div>
        <div>
          <span className="label">Avg / day</span>
          <b className="display">{data.length ? Math.round(total / data.length) : 0}</b>
        </div>
        <div>
          <span className="label">Top model</span>
          <b className="display kpi-sm">{modelById(byModel[0]?.[0])?.name ?? '—'}</b>
        </div>
      </div>

      <section className="chart">
        <div className="chart-head">
          <span className="label">
            <b>Daily spend</b>
          </span>
          <span className="label">{h ? `${new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} — ${h.credits} cr` : 'Hover a day'}</span>
        </div>
        <div className="bars" onMouseLeave={() => setHover(null)}>
          {data.map((d, i) => (
            <span key={d.date} className={`bar ${hover === i ? 'is-on' : ''}`} style={{ height: `${(d.credits / max) * 100}%` }} onMouseEnter={() => setHover(i)} />
          ))}
        </div>
        <div className="chart-axis label">
          <span>{data[0]?.date.slice(5)}</span>
          <span>{data[data.length - 1]?.date.slice(5)}</span>
        </div>
      </section>

      <section className="splits">
        <span className="label">
          <b>By model</b>
        </span>
        {byModel.map(([id, v], i) => {
          const m = modelById(id)
          return (
            <div key={id} className="split">
              <span className="label">{String(i + 1).padStart(2, '0')}</span>
              <span className="split-name">{m?.name}</span>
              <span className="split-track">
                <i className="split-fill" style={{ width: `${(v / Math.max(1, byModel[0][1])) * 100}%` }} />
              </span>
              <span className="split-v">{v.toLocaleString('en-US')}</span>
            </div>
          )
        })}
      </section>
    </div>
  )
}
