import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from '../lib/motion'
import { Icon, type IconName } from '../components/ui'
import { useTilt } from '../lib/hooks'
import { Count, usePageIn } from './kit'

const IDEAS = ['Research top 3 open banking APIs and create a comparison deck', 'Build a TypeScript REST API with JWT auth and PostgreSQL', 'Build a 5-year SaaS financial model with forecasting']

const FEATURES: { icon: IconName; label: string }[] = [
  { icon: 'globe', label: 'Live web research' },
  { icon: 'code', label: 'Real code execution' },
  { icon: 'doc', label: 'PPTX · DOCX · XLSX' },
  { icon: 'download', label: 'Downloadable ZIP' },
  { icon: 'layers', label: 'Iterates until done' },
  { icon: 'bolt', label: 'Python · Node · Go' },
]

type Step = { k: 'think' | 'search' | 'write' | 'run' | 'fix' | 'done'; t: string }
const SCRIPTS: Step[][] = [
  [
    { k: 'think', t: 'Planning: compare Plaid, TrueLayer, Mono' },
    { k: 'search', t: 'Reading 14 sources — pricing, coverage, SDKs' },
    { k: 'write', t: 'comparison.xlsx' },
    { k: 'write', t: 'open-banking-deck.pptx' },
    { k: 'run', t: 'Checking every figure against sources' },
    { k: 'done', t: 'Deck ready — 12 slides' },
  ],
  [
    { k: 'think', t: 'Planning: Express + TypeScript, JWT, Postgres' },
    { k: 'write', t: 'src/db/pool.ts' },
    { k: 'write', t: 'src/middleware/auth.ts' },
    { k: 'run', t: 'npm test — 23 passed, 1 failed' },
    { k: 'fix', t: 'Token expiry used seconds, expected ms' },
    { k: 'done', t: 'npm test — 24 passed · 14 files' },
  ],
  [
    { k: 'think', t: 'Planning: revenue, churn, CAC, runway' },
    { k: 'search', t: 'Benchmarking SaaS growth rates' },
    { k: 'write', t: 'model.py' },
    { k: 'run', t: 'python model.py — 5-year forecast' },
    { k: 'write', t: 'saas-model.xlsx' },
    { k: 'done', t: 'Model ready with 3 scenarios' },
  ],
]
const KIND_ICON: Record<Step['k'], IconName> = { think: 'sparkle', search: 'globe', write: 'file', run: 'bolt', fix: 'refresh', done: 'check' }

export default function Missions() {
  const root = usePageIn<HTMLDivElement>()
  const navigate = useNavigate()
  const [script, setScript] = useState(1)
  const rocket = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    if (!rocket.current) return
    gsap.fromTo(rocket.current, { x: -30, y: 30, opacity: 0, rotate: -20 }, { x: 0, y: 0, opacity: 1, rotate: 0, duration: 1.1, ease: 'back.out(1.6)', delay: 0.2 })
  }, [])

  return (
    <div ref={root} className="kp ms">
      <header className="ms-title reveal">
        <span ref={rocket} className="ms-rocket">
          <Icon name="rocket" size={26} />
          <i className="ms-trail" />
        </span>
        <h1>Missions</h1>
        <span className="k-badge shimmer">Pro Max</span>
      </header>

      <div className="ms-stats">
        <Stat lead>
          <b className="grad-num">
            <Count value={10} duration={1.6} />
          </b>
          <small>missions/month included</small>
        </Stat>
        <Stat>
          <b>Sandbox</b>
          <small>live code execution</small>
        </Stat>
        <Stat>
          <b>Flat rate</b>
          <small>simple overage, no surprises</small>
        </Stat>
      </div>

      <h4 className="k-kicker reveal">What others are building</h4>
      <div className="ms-ideas">
        {IDEAS.map((idea, i) => (
          <button key={idea} className={`ms-idea reveal ${script === i ? 'on' : ''}`} onClick={() => setScript(i)}>
            <span className="ms-idea-dot" />
            <span>{idea}</span>
            <span className="ms-idea-go">
              {script === i ? 'Watching' : 'Preview'} <Icon name="send" size={13} />
            </span>
          </button>
        ))}
      </div>

      <section className="ms-unlock reveal">
        <span className="ms-unlock-border" aria-hidden />
        <AgentDemo key={script} steps={SCRIPTS[script]} goal={IDEAS[script]} />
        <div className="ms-unlock-copy">
          <span className="k-kicker accent">
            <i /> Unlock with Pro Max
          </span>
          <h2>Your AI that actually does the work</h2>
          <p>Give it a goal. It searches, writes code, runs it, fixes bugs, and hands you finished files — all on its own.</p>
          <ul className="ms-feats">
            {FEATURES.map((f) => (
              <li key={f.label}>
                <Icon name={f.icon} size={16} /> {f.label}
              </li>
            ))}
          </ul>
          <div className="ms-cta">
            <button className="k-btn primary lg shine" onClick={() => navigate('/app/subscription')}>
              <Icon name="rocket" size={17} /> Upgrade to Pro Max — $149.00/mo
            </button>
            <button className="k-link" onClick={() => navigate('/app/subscription')}>
              See what's included
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

function Stat({ children, lead }: { children: React.ReactNode; lead?: boolean }) {
  const ref = useTilt<HTMLDivElement>(6)
  return (
    <div ref={ref} className={`ms-stat reveal ${lead ? 'lead' : ''}`}>
      <span className="ms-stat-shine" aria-hidden />
      {children}
    </div>
  )
}

/** A looping, scripted agent run: terminal feed on the left, files appearing on the right. */
function AgentDemo({ steps, goal }: { steps: Step[]; goal: string }) {
  const [n, setN] = useState(0)
  const feed = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const t = setTimeout(() => setN((x) => (x >= steps.length + 3 ? 0 : x + 1)), n === 0 ? 700 : 1100)
    return () => clearTimeout(t)
  }, [n, steps.length])
  useLayoutEffect(() => {
    const last = feed.current?.querySelector('.ad-step:last-child')
    if (last && n > 0 && n <= steps.length) gsap.from(last, { x: -16, opacity: 0, duration: 0.5, ease: 'kwoat' })
  }, [n, steps.length])
  const shown = steps.slice(0, Math.min(n, steps.length))
  const files = shown.filter((s) => s.k === 'write')
  const done = n >= steps.length
  return (
    <div className="ms-demo">
      <div className="ms-demo-bar">
        <span className="ms-demo-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="ms-demo-goal">{goal}</span>
        <span className={`ms-demo-status ${done ? 'done' : ''}`}>
          <span className="dot pulse" /> {done ? 'Complete' : 'Running'}
        </span>
      </div>
      <div className="ms-demo-body">
        <div ref={feed} className="ms-demo-feed">
          {shown.map((s, i) => (
            <div key={i} className={`ad-step k-${s.k}`}>
              <span className="ad-ico">
                <Icon name={KIND_ICON[s.k]} size={13} />
              </span>
              <span>{s.k === 'write' ? `Writing ${s.t}` : s.t}</span>
            </div>
          ))}
          {!done && (
            <div className="ad-step pending">
              <span className="ad-ico">
                <span className="k-spin" />
              </span>
              <span className="ad-typing">
                <i />
                <i />
                <i />
              </span>
            </div>
          )}
        </div>
        <div className="ms-demo-files">
          <small>Workspace</small>
          {files.map((f) => (
            <span key={f.t} className="ms-demo-file">
              <Icon name="file" size={13} /> {f.t}
            </span>
          ))}
          {done && (
            <span className="ms-demo-zip">
              <Icon name="download" size={13} /> Download all
            </span>
          )}
        </div>
      </div>
      <i className="ms-demo-progress" style={{ transform: `scaleX(${Math.min(1, n / steps.length)})` }} />
    </div>
  )
}
