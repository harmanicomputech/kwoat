import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { gsap } from '../lib/motion'
import { Icon } from '../components/ui'
import { SplitFlap } from '../components/SplitFlap'
import { api, MODELS, modelById, type Message, type RouteDecision } from '../api'
import { useAuth } from '../lib/store'

const IDEAS = [
  ['Build', 'a landing page for a specialty coffee brand'],
  ['Debug', 'why does my useEffect run twice?'],
  ['Draw', 'a neon fox in a rainy Tokyo alley'],
  ['Analyse', 'Q2 vs Q3 revenue — what changed?'],
]
const uid = () => Math.random().toString(36).slice(2)

export default function Chat() {
  const { user, spend } = useAuth()
  const [params, setParams] = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [routes, setRoutes] = useState<Record<string, RouteDecision>>({})
  const [input, setInput] = useState('')
  const [model, setModel] = useState('auto')
  const [picker, setPicker] = useState(false)
  const [busy, setBusy] = useState(false)
  const [routing, setRouting] = useState(false)
  const abort = useRef<AbortController | null>(null)
  const list = useRef<HTMLDivElement>(null)
  const hello = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hello.current) return
    const ctx = gsap.context(() => {
      gsap.from('.ch-hi .w', { yPercent: 110, duration: 1.3, ease: 'kwoat', stagger: 0.06 })
      gsap.from('.ch-idea', { y: 30, opacity: 0, duration: 1, ease: 'kwoat', stagger: 0.07, delay: 0.3 })
    }, hello)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    const p = params.get('prompt')
    if (p) {
      setParams({}, { replace: true })
      send(p)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' })
  }, [messages, routing])

  useEffect(() => () => abort.current?.abort(), [])

  async function send(text = input) {
    const q = text.trim()
    if (!q || busy) return
    setInput('')
    const botId = uid()
    setMessages((m) => [...m, { id: uid(), role: 'user', content: q, createdAt: Date.now() }])
    setBusy(true)
    setRouting(true)
    abort.current = new AbortController()
    try {
      await api.streamChat(q, model, {
        signal: abort.current.signal,
        onRoute: (d) => {
          setRouting(false)
          setRoutes((r) => ({ ...r, [botId]: d }))
          setMessages((m) => [...m, { id: botId, role: 'assistant', content: '', modelId: d.modelId, createdAt: Date.now() }])
        },
        onToken: (t) => setMessages((m) => m.map((x) => (x.id === botId ? { ...x, content: x.content + t } : x))),
        onDone: ({ cost }) => {
          setMessages((m) => m.map((x) => (x.id === botId ? { ...x, cost } : x)))
          spend(cost)
        },
      })
    } catch {
      /* stopped */
    } finally {
      setRouting(false)
      setBusy(false)
    }
  }

  const current = model === 'auto' ? null : modelById(model)
  const first = user?.name.split(' ')[0] ?? ''

  return (
    <div className="chat">
      <div ref={list} className="ch-scroll">
        {messages.length === 0 ? (
          <div ref={hello} className="ch-empty">
            <h1 className="ch-hi display">
              {`Good ${greeting()},`.split(' ').map((w, i) => (
                <span className="w-mask" key={i}>
                  <span className="w">{w}&nbsp;</span>
                </span>
              ))}
              <br />
              <span className="w-mask">
                <em className="w signal">{first}.</em>
              </span>
            </h1>
            <p className="ch-lede">Ask anything. Kwoat picks the model, you see the price.</p>
            <div className="ch-ideas">
              {IDEAS.map(([verb, rest], i) => (
                <button key={verb} className="ch-idea" onClick={() => send(`${verb} ${rest}`)}>
                  <span className="label">{String(i + 1).padStart(2, '0')}</span>
                  <span>
                    <b className="display">{verb}</b> {rest}
                  </span>
                  <Icon name="send" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="ch-thread">
            {messages.map((m, i) =>
              m.role === 'user' ? (
                <p key={m.id} className="ch-user display">
                  <span className="label">{String(Math.floor(i / 2) + 1).padStart(2, '0')} · You</span>
                  {m.content}
                </p>
              ) : (
                <Reply key={m.id} m={m} route={routes[m.id]} streaming={busy && i === messages.length - 1} />
              ),
            )}
            {routing && (
              <div className="ch-routing">
                <span className="label">Routing</span>
                <span className="ch-scan" />
              </div>
            )}
          </div>
        )}
      </div>

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
      >
        <textarea
          value={input}
          rows={1}
          placeholder="Ask anything — the best model is picked for you"
          onChange={(e) => {
            setInput(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(200, e.target.scrollHeight) + 'px'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
        />
        <div className="cp-row">
          <button type="button" className="cp-ic" aria-label="Attach">
            <Icon name="plus" />
          </button>
          <div className="cp-pick">
            <button type="button" className="cp-mode" onClick={() => setPicker((p) => !p)} aria-expanded={picker}>
              <span className="cp-knob" style={{ transform: `rotate(${model === 'auto' ? -60 : MODELS.findIndex((x) => x.id === model) * 22 - 40}deg)` }} />
              <span className="label">
                <b>{current?.name ?? 'Auto'}</b>
              </span>
            </button>
            {picker && (
              <div className="cp-menu">
                {[{ id: 'auto', name: 'Auto — best per prompt', cost: 0, color: 'var(--signal)' }, ...MODELS.filter((x) => !x.strengths.includes('images'))].map((x) => (
                  <button
                    type="button"
                    key={x.id}
                    className={model === x.id ? 'is-on' : ''}
                    onClick={() => {
                      setModel(x.id)
                      setPicker(false)
                    }}
                  >
                    <i style={{ background: x.color }} />
                    {x.name}
                    {x.cost > 0 && <span className="label">~{x.cost} cr</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className="cp-gap" />
          <button type="button" className="cp-ic" aria-label="Voice">
            <Icon name="mic" />
          </button>
          {busy ? (
            <button type="button" className="cp-send is-stop" onClick={() => abort.current?.abort()} aria-label="Stop">
              <span />
            </button>
          ) : (
            <button type="submit" className="cp-send" disabled={!input.trim()} aria-label="Send">
              <Icon name="send" />
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

function Reply({ m, route, streaming }: { m: Message; route?: RouteDecision; streaming: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ref.current) gsap.from(ref.current, { y: 24, opacity: 0, duration: 0.9, ease: 'kwoat' })
  }, [])
  const model = modelById(m.modelId)
  return (
    <div ref={ref} className="ch-reply">
      <div className="ch-stub">
        <span className="label">Routed to</span>
        <SplitFlap value={model?.name ?? ''} length={17} className="flap-stub" stagger={1} />
        {route && <span className="label ch-why">{route.reason}</span>}
        <span className="ch-cost label">{m.cost !== undefined ? `${m.cost} cr` : '— cr'}</span>
      </div>
      <div className="ch-body">
        {m.content}
        {streaming && <span className="ch-caret" />}
      </div>
    </div>
  )
}

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'
}
