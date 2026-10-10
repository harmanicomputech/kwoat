import { useEffect, useRef, useState } from 'react'
import { gsap, Flip } from '../lib/motion'
import { Icon } from '../components/ui'
import { api, MODELS, modelById, type Tier } from '../api'
import { useAuth } from '../lib/store'

const TIERS: { tier: Tier; label: string; note?: string }[] = [
  { tier: 'standard', label: 'Standard' },
  { tier: 'advanced', label: 'Advanced', note: 'PayG+' },
  { tier: 'premium', label: 'Premium', note: 'Pro only' },
]

const TEXT_MODELS = MODELS.filter((m) => !m.strengths.includes('images'))

interface Result {
  id: string
  text: string
  done: boolean
  ms: number
}

export default function Compare() {
  const { spend } = useAuth()
  const [selected, setSelected] = useState<string[]>(['gpt-4o-mini', 'gpt-5.4', 'gemini-3.1-pro', 'claude-sonnet-4.6'])
  const [prompt, setPrompt] = useState('Explain quantum computing to a 12-year-old in 3 sentences.')
  const [results, setResults] = useState<Result[] | null>(null)
  const [winner, setWinner] = useState<string | null>(null)
  const grid = useRef<HTMLDivElement>(null)

  const est = selected.reduce((n, id) => n + (modelById(id)?.cost ?? 0), 0)

  const toggle = (id: string) => {
    const state = Flip.getState('.cmp-model')
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length >= 4 ? s : [...s, id]))
    requestAnimationFrame(() => Flip.from(state, { duration: 0.4, ease: 'kwoat' }))
  }

  const run = async () => {
    if (!selected.length || !prompt.trim()) return
    setWinner(null)
    const start = performance.now()
    setResults(selected.map((id) => ({ id, text: '', done: false, ms: 0 })))
    await Promise.all(
      selected.map((id) =>
        api.streamChat(prompt, id, {
          onToken: (t) => setResults((r) => r?.map((x) => (x.id === id ? { ...x, text: x.text + t } : x)) ?? r),
          onDone: () => setResults((r) => r?.map((x) => (x.id === id ? { ...x, done: true, ms: Math.round(performance.now() - start) } : x)) ?? r),
        }),
      ),
    )
    spend(est)
  }

  useEffect(() => {
    if (!results || !grid.current) return
    if (results.every((r) => !r.text)) {
      gsap.from(grid.current.children, { y: 40, opacity: 0, rotateX: -20, stagger: 0.08, duration: 0.8, ease: 'kwoat' })
    }
  }, [results])

  return (
    <div className="page compare">
      <header className="page-head">
        <div>
          <span className="eyebrow">Compare</span>
          <h1>Same prompt. Every model.</h1>
          <p>Run up to four models side by side — you pay for each.</p>
        </div>
      </header>

      <section className="cmp-picker card">
        <h3>Select models to compare (up to 4)</h3>
        {TIERS.map((t) => (
          <div key={t.tier} className="cmp-tier">
            <h4>
              {t.label} {t.note && <small>· {t.note}</small>}
            </h4>
            <div className="cmp-models">
              {TEXT_MODELS.filter((m) => m.tier === t.tier).map((m) => {
                const on = selected.includes(m.id)
                const disabled = !on && selected.length >= 4
                return (
                  <button key={m.id} className={`cmp-model ${on ? 'is-on' : ''}`} disabled={disabled} onClick={() => toggle(m.id)} data-cursor="hover">
                    <span className="cmp-check">{on && <Icon name="check" size={14} />}</span>
                    <span>
                      <b>{m.name}</b>
                      <small>~{m.cost} cr</small>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
        <div className="cmp-run">
          <input value={prompt} onChange={(e) => setPrompt(e.target.value)} aria-label="Prompt" placeholder="Type a prompt to compare…" />
          <span className="cmp-est">
            {selected.length} selected · est. <b>{est} credits</b>
          </span>
          <button className="btn btn-primary" onClick={run} disabled={!selected.length} data-cursor="hover">
            <Icon name="compare" /> Run comparison
          </button>
        </div>
      </section>

      {results && (
        <section ref={grid} className="cmp-results" style={{ ['--n' as string]: results.length }}>
          {results.map((r) => {
            const m = modelById(r.id)!
            const fastest = results.filter((x) => x.done).sort((a, b) => a.ms - b.ms)[0]?.id === r.id
            return (
              <article key={r.id} className={`cmp-col card ${winner === r.id ? 'is-winner' : ''}`}>
                <header>
                  <span className="dot" style={{ background: m.color }} />
                  <b>{m.name}</b>
                  {fastest && <span className="cmp-badge">⚡ fastest</span>}
                </header>
                <div className="cmp-text">
                  {r.text}
                  {!r.done && <span className="caret" />}
                </div>
                <footer>
                  <span>{r.done ? `${(r.ms / 1000).toFixed(1)}s · ${m.cost} cr` : 'streaming…'}</span>
                  <button className={`cmp-pick ${winner === r.id ? 'is-on' : ''}`} onClick={() => setWinner(r.id)} disabled={!r.done}>
                    {winner === r.id ? '★ Picked' : 'Pick best'}
                  </button>
                </footer>
              </article>
            )
          })}
        </section>
      )}
    </div>
  )
}
