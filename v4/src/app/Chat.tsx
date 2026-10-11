import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { gsap } from '../lib/motion'
import { Icon } from '../components/ui'
import { api, MODELS, modelById, type Message, type RouteDecision } from '../api'
import { useAuth } from '../lib/store'

const SUGGESTIONS = [
  { icon: '✦', title: 'Build a landing page', body: 'for a specialty coffee brand' },
  { icon: '⌘', title: 'Debug my code', body: 'why does my useEffect run twice?' },
  { icon: '◐', title: 'Generate an image', body: 'neon fox in a rainy Tokyo alley' },
  { icon: '∑', title: 'Analyse numbers', body: 'compare Q2 vs Q3 revenue' },
]

const uid = () => Math.random().toString(36).slice(2)

export default function Chat() {
  const { user, spend } = useAuth()
  const [params, setParams] = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [model, setModel] = useState<string>('auto')
  const [picker, setPicker] = useState(false)
  const [routing, setRouting] = useState<RouteDecision | null>(null)
  const [busy, setBusy] = useState(false)
  const abort = useRef<AbortController | null>(null)
  const list = useRef<HTMLDivElement>(null)
  const empty = useRef<HTMLDivElement>(null)
  const textarea = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!empty.current) return
    const ctx = gsap.context(() => {
      gsap.from('.ch-hello > *', { y: 30, opacity: 0, stagger: 0.08, duration: 0.9, ease: 'kwoat' })
      gsap.from('.ch-sug', { y: 40, opacity: 0, rotateX: -30, stagger: 0.07, duration: 0.9, ease: 'kwoat', delay: 0.2 })
    }, empty)
    return () => ctx.revert()
  }, [])

  // A prompt handed over from the landing page
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
    const userMsg: Message = { id: uid(), role: 'user', content: q, createdAt: Date.now() }
    const botId = uid()
    setMessages((m) => [...m, userMsg])
    setBusy(true)
    abort.current = new AbortController()
    try {
      await api.streamChat(q, model, {
        signal: abort.current.signal,
        onRoute: (d) => {
          setRouting(d)
          setMessages((m) => [...m, { id: botId, role: 'assistant', content: '', modelId: d.modelId, createdAt: Date.now() }])
        },
        onToken: (t) => setMessages((m) => m.map((x) => (x.id === botId ? { ...x, content: x.content + t } : x))),
        onDone: ({ cost }) => {
          setMessages((m) => m.map((x) => (x.id === botId ? { ...x, cost } : x)))
          spend(cost)
        },
      })
    } catch {
      /* aborted */
    } finally {
      setRouting(null)
      setBusy(false)
    }
  }

  const current = model === 'auto' ? null : modelById(model)

  return (
    <div className="chat">
      <div ref={list} className="ch-list">
        {messages.length === 0 ? (
          <div ref={empty} className="ch-empty">
            <div className="ch-hello">
              <div className="ch-orb" />
              <h1>
                Good {greeting()}, <span className="grad-text">{user?.name.split(' ')[0]}</span>
              </h1>
              <p>Ask anything — Kwoat picks the best model automatically.</p>
            </div>
            <div className="ch-sugs">
              {SUGGESTIONS.map((s) => (
                <button key={s.title} className="ch-sug card spotlight" onClick={() => send(`${s.title} ${s.body}`)} data-cursor="hover">
                  <span className="ch-sug-ico">{s.icon}</span>
                  <b>{s.title}</b>
                  <small>{s.body}</small>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="ch-thread">
            {messages.map((m) => (
              <Bubble key={m.id} m={m} streaming={busy && m.role === 'assistant' && m === messages[messages.length - 1]} />
            ))}
            {routing === null && busy && messages[messages.length - 1]?.role === 'user' && (
              <div className="ch-routing">
                <span className="ch-scan" />
                Picking the best model…
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
          ref={textarea}
          value={input}
          rows={1}
          placeholder="Ask anything — best model selected automatically…"
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
        <div className="composer-row">
          <button type="button" className="icon-btn" aria-label="Attach">
            <Icon name="plus" />
          </button>
          <div className="picker">
            <button type="button" className="chip picker-btn" onClick={() => setPicker((p) => !p)} aria-expanded={picker}>
              <span className="dot" style={{ background: current?.color ?? 'var(--violet-2)' }} />
              {current?.name ?? 'Auto'} ▾
            </button>
            {picker && (
              <div className="picker-menu card">
                <button
                  type="button"
                  className={model === 'auto' ? 'is-on' : ''}
                  onClick={() => {
                    setModel('auto')
                    setPicker(false)
                  }}
                >
                  <span className="dot" /> Auto <small>best model per prompt</small>
                </button>
                {MODELS.filter((m) => !m.strengths.includes('images')).map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    className={model === m.id ? 'is-on' : ''}
                    onClick={() => {
                      setModel(m.id)
                      setPicker(false)
                    }}
                  >
                    <span className="dot" style={{ background: m.color }} /> {m.name} <small>~{m.cost} cr</small>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="composer-right">
            <button type="button" className="icon-btn" aria-label="Voice input">
              <Icon name="mic" />
            </button>
            {busy ? (
              <button type="button" className="send-btn stop" onClick={() => abort.current?.abort()} aria-label="Stop">
                <span className="stop-sq" />
              </button>
            ) : (
              <button type="submit" className="send-btn" aria-label="Send" disabled={!input.trim()}>
                <Icon name="send" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

function Bubble({ m, streaming }: { m: Message; streaming: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ref.current) gsap.from(ref.current, { y: 20, opacity: 0, scale: 0.97, duration: 0.6, ease: 'kwoat' })
  }, [])
  const model = modelById(m.modelId)
  return (
    <div ref={ref} className={`bubble ${m.role}`}>
      {m.role === 'assistant' && model && (
        <div className="bubble-meta">
          <span className="dot" style={{ background: model.color }} /> {model.name}
          {m.cost !== undefined && <span className="bubble-cost">{m.cost} cr</span>}
        </div>
      )}
      <div className="bubble-body">
        {m.content}
        {streaming && <span className="caret" />}
      </div>
    </div>
  )
}

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'
}
