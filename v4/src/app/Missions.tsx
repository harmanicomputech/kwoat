import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/motion'
import { Icon } from '../components/ui'
import { api, type Mission } from '../api'

const IDEAS = ['Build a TypeScript REST API with JWT auth and Postgres', 'Research deck: African fintech trends 2026', 'Financial model for a 3-store bakery']
const KIND_ICON: Record<string, string> = { think: '✦', search: '⌕', write: '+', run: '▶', fix: '⟲', done: '✓' }

export default function Missions() {
  const [goal, setGoal] = useState(IDEAS[0])
  const [mission, setMission] = useState<Mission | null>(null)
  const abort = useRef<AbortController | null>(null)
  const feed = useRef<HTMLDivElement>(null)

  useEffect(() => () => abort.current?.abort(), [])
  useEffect(() => {
    const el = feed.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    const last = el.querySelector('.ms-step:last-child')
    if (last) gsap.from(last, { x: -30, opacity: 0, duration: 0.6, ease: 'kwoat' })
  }, [mission?.steps.length])

  const start = async () => {
    abort.current = new AbortController()
    try {
      await api.runMission(goal, setMission, abort.current.signal)
    } catch {
      setMission((m) => (m ? { ...m, status: 'stopped' } : m))
    }
  }

  const progress = mission ? Math.min(1, mission.steps.length / 11) : 0

  return (
    <div className="page missions">
      {!mission ? (
        <div className="ms-start">
          <div className="ms-rocket">
            <Icon name="rocket" size={46} />
          </div>
          <span className="eyebrow">Agent missions</span>
          <h1>Give it a goal. Get finished work.</h1>
          <p>Kwoat’s agent searches the web, writes code, runs it in a live sandbox, fixes bugs and hands you the files.</p>
          <div className="ms-input card">
            <textarea value={goal} onChange={(e) => setGoal(e.target.value)} rows={2} aria-label="Mission goal" />
            <button className="btn btn-primary" onClick={start} data-cursor="hover">
              <Icon name="rocket" /> Launch mission
            </button>
          </div>
          <div className="ms-ideas">
            {IDEAS.map((i) => (
              <button key={i} className="chip" onClick={() => setGoal(i)}>
                {i}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="ms-run">
          <header className="ms-head card">
            <span className={`ms-status ${mission.status}`}>
              <span className="dot pulse" /> {mission.status === 'running' ? 'Mission running' : mission.status === 'done' ? 'Mission complete' : 'Stopped'}
            </span>
            <span className="ms-goal">{mission.goal}</span>
            <span className="chip">Step {mission.steps.length}</span>
            {mission.status === 'running' ? (
              <button className="btn btn-ghost btn-sm ms-stop" onClick={() => abort.current?.abort()}>
                <Icon name="x" size={14} /> Stop
              </button>
            ) : (
              <button className="btn btn-ghost btn-sm" onClick={() => setMission(null)}>
                New mission
              </button>
            )}
            <i className="ms-bar" style={{ transform: `scaleX(${progress})` }} />
          </header>
          <div className="ms-body">
            <div ref={feed} className="ms-feed card">
              <h4>Agent feed</h4>
              {mission.steps.map((s) => (
                <div key={s.id} className={`ms-step k-${s.kind}`}>
                  <span className="ms-ico">{KIND_ICON[s.kind]}</span>
                  <div>
                    <b>{s.label}</b>
                    {s.detail && <small>{s.detail}</small>}
                  </div>
                </div>
              ))}
              {mission.status === 'running' && (
                <div className="ms-step k-pending">
                  <span className="ms-ico spinner" />
                  <div>
                    <b>Working…</b>
                  </div>
                </div>
              )}
            </div>
            <aside className="ms-files card">
              <h4>
                <Icon name="file" size={14} /> Workspace
              </h4>
              {mission.files.map((f) => (
                <div key={f} className="ms-file">
                  <Icon name="file" size={14} /> {f} <span className="ms-ok">✓</span>
                </div>
              ))}
              {mission.status === 'done' && (
                <button className="btn btn-primary btn-sm ms-dl">
                  <Icon name="download" size={16} /> Download all
                </button>
              )}
            </aside>
          </div>
        </div>
      )}
    </div>
  )
}
