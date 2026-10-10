import { useEffect, useRef, useState } from 'react'
import { Btn, Icon } from '../components/ui'
import { api, type Mission } from '../api'

const IDEAS = ['Build a TypeScript REST API with JWT auth and Postgres', 'Research deck: African fintech trends 2026', 'Financial model for a 3-store bakery']

export default function Missions() {
  const [goal, setGoal] = useState(IDEAS[0])
  const [mission, setMission] = useState<Mission | null>(null)
  const abort = useRef<AbortController | null>(null)
  const feed = useRef<HTMLDivElement>(null)

  useEffect(() => () => abort.current?.abort(), [])
  useEffect(() => {
    feed.current?.scrollTo({ top: feed.current.scrollHeight, behavior: 'smooth' })
  }, [mission?.steps.length])

  const start = async () => {
    abort.current = new AbortController()
    try {
      await api.runMission(goal, setMission, abort.current.signal)
    } catch {
      setMission((m) => (m ? { ...m, status: 'stopped' } : m))
    }
  }

  if (!mission)
    return (
      <div className="page">
        <header className="pg-head">
          <h1 className="display">
            Brief the agent.
            <br />
            <em>Collect the files.</em>
          </h1>
          <p>It plans, searches, writes code, runs it in a sandbox, fixes what fails, and hands back finished work.</p>
        </header>
        <div className="brief">
          <span className="label">
            <b>Mission brief</b> — what should be true when it’s done?
          </span>
          <textarea value={goal} onChange={(e) => setGoal(e.target.value)} rows={3} aria-label="Mission goal" />
          <div className="brief-foot">
            <div className="brief-ideas">
              {IDEAS.map((i) => (
                <button key={i} onClick={() => setGoal(i)} className="label">
                  {i}
                </button>
              ))}
            </div>
            <Btn variant="signal" onClick={start}>
              Launch mission
            </Btn>
          </div>
        </div>
      </div>
    )

  return (
    <div className="page mission">
      <header className="ms-bar">
        <span className="label">
          <span className={`led ${mission.status === 'done' ? 'ok' : 'blink'}`} /> {mission.status === 'running' ? 'Running' : mission.status === 'done' ? 'Complete' : 'Stopped'}
        </span>
        <span className="ms-goal">{mission.goal}</span>
        <span className="label">Step {String(mission.steps.length).padStart(2, '0')}/11</span>
        {mission.status === 'running' ? (
          <Btn size="sm" variant="line" onClick={() => abort.current?.abort()} arrow={false}>
            Stop
          </Btn>
        ) : (
          <Btn size="sm" variant="line" onClick={() => setMission(null)}>
            New mission
          </Btn>
        )}
        <i className="ms-progress" style={{ transform: `scaleX(${mission.steps.length / 11})` }} />
      </header>
      <div className="ms-grid">
        <div ref={feed} className="ms-term">
          <p className="term-goal">$ kwoat mission "{mission.goal}"</p>
          {mission.steps.map((s) => (
            <p key={s.id} className={`term-l t-${s.kind}`}>
              <span>[{s.kind.padEnd(6, ' ')}]</span> {s.label}
              {s.detail && <em> — {s.detail}</em>}
            </p>
          ))}
          {mission.status === 'running' && <span className="term-cur" />}
        </div>
        <aside className="ms-files">
          <span className="label">
            <b>Workspace</b> — {mission.files.length} files
          </span>
          {mission.files.map((f) => (
            <div key={f} className="ms-file">
              <Icon name="file" size={14} />
              {f}
              <span className="label">✓</span>
            </div>
          ))}
          {mission.status === 'done' && (
            <Btn variant="signal" size="sm" className="ms-dl">
              Download all
            </Btn>
          )}
        </aside>
      </div>
    </div>
  )
}
