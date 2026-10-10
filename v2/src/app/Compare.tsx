import { useState } from 'react'
import { Btn, Icon } from '../components/ui'
import { api, MODELS, modelById, type Tier } from '../api'
import { useAuth } from '../lib/store'

const TIERS: { tier: Tier; label: string }[] = [
  { tier: 'standard', label: 'Standard' },
  { tier: 'advanced', label: 'Advanced · PayG+' },
  { tier: 'premium', label: 'Premium · Pro' },
]
const TEXT = MODELS.filter((m) => !m.strengths.includes('images'))

interface Out {
  id: string
  text: string
  done: boolean
  ms: number
}

export default function Compare() {
  const { spend } = useAuth()
  const [sel, setSel] = useState<string[]>(['gpt-5.4', 'claude-sonnet-4.6', 'gemini-3.1-pro', 'grok-4.20'])
  const [prompt, setPrompt] = useState('Explain quantum computing to a 12-year-old in 3 sentences.')
  const [out, setOut] = useState<Out[] | null>(null)
  const [best, setBest] = useState<string | null>(null)
  const est = sel.reduce((n, id) => n + (modelById(id)?.cost ?? 0), 0)
  const running = !!out && out.some((o) => !o.done)

  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length >= 4 ? s : [...s, id]))

  const run = async () => {
    if (!sel.length || running) return
    setBest(null)
    const t0 = performance.now()
    setOut(sel.map((id) => ({ id, text: '', done: false, ms: 0 })))
    await Promise.all(
      sel.map((id) =>
        api.streamChat(prompt, id, {
          onToken: (t) => setOut((o) => o?.map((x) => (x.id === id ? { ...x, text: x.text + t } : x)) ?? o),
          onDone: () => setOut((o) => o?.map((x) => (x.id === id ? { ...x, done: true, ms: Math.round(performance.now() - t0) } : x)) ?? o),
        }),
      ),
    )
    spend(est)
  }

  const fastest = out?.filter((o) => o.done).sort((a, b) => a.ms - b.ms)[0]?.id

  return (
    <div className="page">
      <header className="pg-head">
        <h1 className="display">
          Same prompt.
          <br />
          <em>Every voice.</em>
        </h1>
        <p>Patch up to four models into the desk, run them together, keep the best take. You pay for each channel.</p>
      </header>

      <section className="desk">
        {TIERS.map((t) => (
          <div className="desk-row" key={t.tier}>
            <span className="label">{t.label}</span>
            <div className="desk-chips">
              {TEXT.filter((m) => m.tier === t.tier).map((m) => {
                const on = sel.includes(m.id)
                return (
                  <button key={m.id} className={`patch ${on ? 'is-on' : ''}`} disabled={!on && sel.length >= 4} onClick={() => toggle(m.id)}>
                    <i className="patch-jack" />
                    {m.name}
                    <span className="label">{m.cost} cr</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
        <div className="desk-run">
          <input value={prompt} onChange={(e) => setPrompt(e.target.value)} aria-label="Prompt" />
          <span className="label">
            {sel.length}/4 patched · est. <b>{est} cr</b>
          </span>
          <Btn variant="signal" onClick={run} disabled={!sel.length || running}>
            {running ? 'Running…' : 'Run comparison'}
          </Btn>
        </div>
      </section>

      {out && (
        <section className="channels" style={{ ['--n' as string]: out.length }}>
          {out.map((o, i) => {
            const m = modelById(o.id)!
            return (
              <article key={o.id} className={`chan ${best === o.id ? 'is-best' : ''} ${o.done ? '' : 'is-live'}`}>
                <header>
                  <span className="label">
                    <b>CH {i + 1}</b>
                  </span>
                  <span className="chan-name">
                    <i style={{ background: m.color }} />
                    {m.name}
                  </span>
                  {fastest === o.id && <span className="chan-tag label">Fastest</span>}
                </header>
                <div className="chan-vu" aria-hidden>
                  {Array.from({ length: 24 }).map((_, k) => (
                    <i key={k} style={{ animationDelay: `${(k * 61 + i * 137) % 700}ms` }} />
                  ))}
                </div>
                <div className="chan-text">
                  {o.text}
                  {!o.done && <span className="ch-caret" />}
                </div>
                <footer>
                  <span className="label">{o.done ? `${(o.ms / 1000).toFixed(1)}s · ${m.cost} cr` : 'Streaming'}</span>
                  <button className={`solo ${best === o.id ? 'is-on' : ''}`} disabled={!o.done} onClick={() => setBest(o.id)}>
                    {best === o.id ? (
                      <>
                        <Icon name="check" size={12} /> Kept
                      </>
                    ) : (
                      'Keep'
                    )}
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
