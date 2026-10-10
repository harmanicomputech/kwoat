import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/motion'
import { SplitFlap } from '../components/SplitFlap'
import { Section } from '../components/ui'
import { api, modelById } from '../api'
import { useInView } from '../lib/hooks'

// A departures board: every few seconds a new prompt "arrives" at the top,
// pushing the rest down, and each row flips to its routed model.

const FEED = [
  'Poem for my mum’s 60th',
  'Fix CORS error in Express',
  'Logo for a coffee brand',
  'Landing page for bakery',
  'Analyse churn in CSV',
  'What happened in tech today',
  'Summarise this PDF',
  'Debug Python KeyError',
  'Instagram caption, gym',
  'Compare Q2 vs Q3 sales',
  'Draw isometric island',
  'Translate menu to French',
]

interface Row {
  id: number
  prompt: string
  model: string
  cost: number
  ms: number
  status: string
}

let seq = 0
const make = (prompt: string): Row => {
  const d = api.route(prompt)
  const m = modelById(d.modelId)!
  return { id: seq++, prompt, model: m.name, cost: m.cost, ms: 180 + Math.floor(Math.random() * 380), status: 'ROUTED' }
}

export function Board() {
  const [rows, setRows] = useState<Row[]>(() => FEED.slice(0, 6).map(make))
  const [count, setCount] = useState(1284903)
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.1 })
  const cursor = useRef(6)
  const sec = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!inView) return
    const id = setInterval(() => {
      const p = FEED[cursor.current++ % FEED.length]
      setRows((r) => [make(p), ...r].slice(0, 6))
      setCount((c) => c + 7 + Math.floor(Math.random() * 40))
    }, 2600)
    return () => clearInterval(id)
  }, [inView])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.bd-panel', {
        clipPath: 'inset(0 0 100% 0)',
        duration: 1.6,
        ease: 'expo.inOut',
        scrollTrigger: { trigger: '.bd-panel', start: 'top 80%' },
      })
      gsap.from('.bd-copy > *', {
        y: 30,
        opacity: 0,
        stagger: 0.08,
        duration: 1.2,
        ease: 'kwoat',
        scrollTrigger: { trigger: '.bd-copy', start: 'top 80%' },
      })
    }, sec)
    return () => ctx.revert()
  }, [])

  return (
    <Section id="board" index="02" title="Live routing" className="board" dark>
      <div ref={sec} className="container">
        <div className="bd-copy">
          <h2 className="display bd-h">
            Every prompt <em>departs</em>
            <br />
            to the right model.
          </h2>
          <div className="bd-aside">
            <p>
              Writing goes to the fast, cheap model. Code goes to the best debugger. Web pages go to the model that builds them
              best. You never see a picker — just the answer, and its price.
            </p>
            <div className="bd-count">
              <span className="label">Prompts routed this week</span>
              <SplitFlap value={count.toLocaleString('en-US')} length={9} className="flap-count" speed={30} stagger={0} />
            </div>
          </div>
        </div>

        <div ref={ref} className="bd-panel">
          <div className="bd-top">
            <span className="label">
              <span className="led blink" /> Routing board — live
            </span>
            <span className="label">Avg decision 0.4s</span>
          </div>
          <div className="bd-row bd-head label" aria-hidden>
            <span>Prompt</span>
            <span>Routed to</span>
            <span>Time</span>
            <span>Cr</span>
            <span>Status</span>
          </div>
          {rows.map((r, i) => (
            <div className={`bd-row ${i === 0 ? 'is-new' : ''}`} key={r.id}>
              <SplitFlap value={r.prompt} length={26} className="flap-board" stagger={1} />
              <SplitFlap value={r.model} length={17} className="flap-board flap-signal" stagger={1} />
              <SplitFlap value={`${r.ms}MS`} length={5} className="flap-board" />
              <SplitFlap value={String(r.cost)} length={2} className="flap-board" />
              <SplitFlap value={r.status} length={6} className="flap-board flap-ok" />
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}
