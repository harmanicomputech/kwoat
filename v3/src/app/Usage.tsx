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
      gsap.fromTo('.us-bar', { scaleY: 0 }, { scaleY: 1, transformOrigin: 'bottom', stagger: 0.015, duration: 0.9, ease: 'expo.out' })
      gsap.fromTo('.us-split i', { scaleX: 0 }, { scaleX: 1, transformOrigin: 'left', stagger: 0.08, duration: 1.1, ease: 'expo.out' })
      gsap.from('.us-kpi', { y: 20, opacity: 0, stagger: 0.07, duration: 0.7, ease: 'kwoat' })
      const o = { v: 0 }
      gsap.to(o, { v: total, duration: 1.4, ease: 'power3.out', onUpdate: () => {
        const el = root.current?.querySelector('.us-total')
        if (el) el.textContent = Math.round(o.v).toLocaleString()
      } })
    }, root)
    return () => ctx.revert()
  }, [data, total])

  // Smooth line through the bars for the trend
  const line = useMemo(() => {
    if (!data.length) return ''
    const pts = data.map((d, i) => [(i + 0.5) * (1000 / data.length), 300 - (d.credits / max) * 280])
    return pts.reduce((p, [x, y], i) => {
      if (i === 0) return `M${x},${y}`
      const [px, py] = pts[i - 1]
      const cx = (px + x) / 2
      return `${p} C${cx},${py} ${cx},${y} ${x},${y}`
    }, '')
  }, [data, max])

  return (
    <div ref={root} className="page usage">
      <header className="page-head">
        <div>
          <span className="eyebrow">Usage analytics</span>
          <h1>Every credit, accounted for.</h1>
        </div>
        <div className="seg">
          {RANGES.map((r) => (
            <button key={r} className={days === r ? 'is-on' : ''} onClick={() => setDays(r)}>
              {r}d
            </button>
          ))}
        </div>
      </header>

      <div className="us-kpis">
        <div className="us-kpi card">
          <small>Credits used</small>
          <b className="us-total">0</b>
          <span>last {days} days</span>
        </div>
        <div className="us-kpi card">
          <small>Wallet balance</small>
          <b>{user?.credits.standard.toLocaleString()}</b>
          <span>standard credits</span>
        </div>
        <div className="us-kpi card">
          <small>Avg / day</small>
          <b>{data.length ? Math.round(total / data.length) : 0}</b>
          <span>credits</span>
        </div>
        <div className="us-kpi card">
          <small>Top model</small>
          <b className="us-top">{modelById(byModel[0]?.[0])?.name ?? '—'}</b>
          <span>{byModel[0] ? Math.round((byModel[0][1] / Math.max(1, total)) * 100) : 0}% of spend</span>
        </div>
      </div>

      <section className="us-chart card">
        <div className="us-chart-head">
          <h3>Daily spend</h3>
          {hover !== null && data[hover] && (
            <span className="us-tip">
              {new Date(data[hover].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · <b>{data[hover].credits} cr</b>
            </span>
          )}
        </div>
        <div className="us-plot" onMouseLeave={() => setHover(null)}>
          <div className="us-bars">
            {data.map((d, i) => (
              <span
                key={d.date}
                className={`us-bar ${hover === i ? 'is-hover' : ''}`}
                style={{ height: `${(d.credits / max) * 100}%` }}
                onMouseEnter={() => setHover(i)}
              />
            ))}
          </div>
          <svg className="us-line" viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden>
            <path d={line} />
          </svg>
        </div>
      </section>

      <section className="us-models card">
        <h3>By model</h3>
        {byModel.map(([id, v]) => {
          const m = modelById(id)
          return (
            <div key={id} className="us-split">
              <span className="us-name">
                <span className="dot" style={{ background: m?.color }} /> {m?.name}
              </span>
              <span className="us-track">
                <i style={{ width: `${(v / Math.max(1, byModel[0][1])) * 100}%`, background: m?.color }} />
              </span>
              <b>{v.toLocaleString()}</b>
            </div>
          )
        })}
      </section>
    </div>
  )
}
