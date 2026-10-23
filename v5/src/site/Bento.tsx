import { useEffect, useState } from 'react'
import { Icon, Mark, type IconName } from '../components/ui'
import { useSpotlight } from '../lib/hooks'

// Feature grid. Every card has its own small live demo; a glow follows the
// pointer across the whole grid and lights up the card borders.
export function Bento() {
  const grid = useSpotlight<HTMLDivElement>()
  return (
    <section className="bn5 sec5" id="features">
      <div className="container">
        <div className="sec5-head">
          <span className="kick5" data-reveal>
            <Icon name="layers" size={14} /> Everything in one place
          </span>
          <h2 data-split>One app instead of ten subscriptions.</h2>
          <p data-reveal>Chat, compare, create images and video, talk out loud, research the web and run agents — with every major model, in one place.</p>
        </div>
        <div ref={grid} className="bn5-grid">
          <Card className="c-compare" icon="compare" title="Compare models side by side" text="Send one prompt to four models and watch them answer at once. Keep the best.">
            <CompareDemo />
          </Card>
          <Card className="c-image" icon="image" title="Images & video" text="FLUX, Nano Banana and Kling — from the same prompt box.">
            <ImageDemo />
          </Card>
          <Card className="c-voice" icon="mic" title="Voice live" text="Talk to any model, hands-free, in real time.">
            <VoiceDemo />
          </Card>
          <Card className="c-mission" icon="rocket" title="Missions" text="Give it a goal. It researches, codes, tests and hands you the files.">
            <MissionDemo />
          </Card>
          <Card className="c-research" icon="globe" title="Web search & deep research" text="Answers with live sources you can check.">
            <ResearchDemo />
          </Card>
          <Card className="c-docs" icon="doc" title="Real documents" text="Download answers as PPTX, DOCX or XLSX.">
            <DocsDemo />
          </Card>
        </div>
      </div>
    </section>
  )
}

function Card({ className, icon, title, text, children }: { className: string; icon: IconName; title: string; text: string; children: React.ReactNode }) {
  return (
    <article className={`bn5-card spotlight ${className}`} data-reveal>
      <div className="bn5-demo">{children}</div>
      <div className="bn5-copy">
        <span className="bn5-ico">
          <Icon name={icon} size={16} />
        </span>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </article>
  )
}

const COMPARE = [
  { name: 'GPT-5.4', c: '#10b981', w: [92, 70, 84, 40], t: '1.2s' },
  { name: 'Claude Sonnet 4.6', c: '#f59e0b', w: [88, 94, 60, 76], t: '1.6s' },
  { name: 'Gemini 3.1 Pro', c: '#3b82f6', w: [80, 66, 90, 58], t: '1.9s' },
  { name: 'Grok 4.20', c: '#ec4899', w: [70, 86, 52, 0], t: '2.3s' },
]
function CompareDemo() {
  return (
    <div className="cd5">
      <div className="cd5-prompt">
        <Icon name="chat" size={13} /> Explain quantum computing to a 10-year-old
      </div>
      <div className="cd5-cols">
        {COMPARE.map((m, i) => (
          <div key={m.name} className="cd5-col" style={{ ['--c' as string]: m.c, ['--d' as string]: `${i * 0.25}s` }}>
            <header>
              <i />
              {m.name}
              {i === 0 && <span className="cd5-fast">Fastest</span>}
            </header>
            {m.w.map((w, k) =>
              w ? <span key={k} className="cd5-line" style={{ ['--w' as string]: `${w}%`, ['--k' as string]: k }} /> : null,
            )}
            <small>{m.t}</small>
          </div>
        ))}
      </div>
    </div>
  )
}

function ImageDemo() {
  const [seed, setSeed] = useState(0)
  return (
    <div className="im5" onMouseEnter={() => setSeed((s) => s + 1)}>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="im5-tile" style={{ ['--h' as string]: [262, 320, 200, 24][(i + seed) % 4], ['--i' as string]: i }}>
          <i />
          <i />
        </span>
      ))}
      <span className="im5-tag">
        <Icon name="sparkle" size={12} /> FLUX.2 Klein
      </span>
    </div>
  )
}

function VoiceDemo() {
  return (
    <div className="vc5">
      <span className="vc5-orb">
        <i />
        <i />
        <Mark size={22} color="#fff" />
      </span>
      <div className="vc5-wave">
        {Array.from({ length: 28 }).map((_, i) => (
          <i key={i} style={{ animationDelay: `${(i % 7) * -0.15}s`, ['--s' as string]: 0.35 + Math.abs(Math.sin(i * 1.7)) * 0.65 }} />
        ))}
      </div>
      <small className="vc5-cap">“…and book a table for two at eight.”</small>
    </div>
  )
}

const STEPS: { k: string; t: string }[] = [
  { k: 'think', t: 'Planning the API' },
  { k: 'write', t: 'src/auth.ts' },
  { k: 'run', t: 'npm test — 23 passed' },
  { k: 'fix', t: 'Fixed token expiry' },
  { k: 'done', t: '14 files ready' },
]
function MissionDemo() {
  const [n, setN] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setN((x) => (x + 1) % (STEPS.length + 3)), 900)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="mi5">
      {STEPS.slice(0, Math.min(n, STEPS.length)).map((s) => (
        <div key={s.t} className={`mi5-row k-${s.k}`}>
          <span>{s.k === 'done' ? '✓' : s.k === 'fix' ? '⟲' : s.k === 'run' ? '▶' : s.k === 'write' ? '+' : '✦'}</span>
          {s.t}
        </div>
      ))}
      {n < STEPS.length && (
        <div className="mi5-row pending">
          <span className="mi5-spin" /> working
        </div>
      )}
    </div>
  )
}

function ResearchDemo() {
  const sources = ['reuters.com', 'nature.com', 'arxiv.org', 'ft.com', 'bbc.co.uk']
  return (
    <div className="rs5">
      <div className="rs5-q">
        <Icon name="search" size={13} /> Latest on solid-state batteries
      </div>
      <div className="rs5-srcs">
        {sources.map((s, i) => (
          <span key={s} style={{ ['--i' as string]: i }}>
            <i>{s[0].toUpperCase()}</i>
            {s}
          </span>
        ))}
      </div>
    </div>
  )
}

function DocsDemo() {
  const docs = [
    { ext: 'PPTX', c: '#ea580c' },
    { ext: 'DOCX', c: '#2563eb' },
    { ext: 'XLSX', c: '#16a34a' },
  ]
  return (
    <div className="dc5">
      {docs.map((d, i) => (
        <span key={d.ext} className="dc5-file" style={{ ['--c' as string]: d.c, ['--i' as string]: i - 1 }}>
          <i />
          <i />
          <i />
          <b>{d.ext}</b>
        </span>
      ))}
    </div>
  )
}
