import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { gsap, SplitText } from '../lib/motion'
import { Icon, Mark, type IconName } from '../components/ui'
import { api, MODELS, modelById, type RouteDecision } from '../api'
import { useAuth } from '../lib/store'
import { useTilt } from '../lib/hooks'
import { useWorkspace, uid, type ChatMessage, type Conversation, type UsageType } from './workspace'
import { Art, useDismiss, usePop } from './kit'

const TILES: { id: string; icon: IconName; label: string; color: string; prompts: string[] }[] = [
  { id: 'write', icon: 'pencil', label: 'Write', color: '#8b5cf6', prompts: ['Write a launch email for a new fintech app', 'Draft a LinkedIn post about my promotion', 'Write a short story set in Lagos in 2080', 'Rewrite this paragraph to sound more confident'] },
  { id: 'code', icon: 'code', label: 'Code', color: '#3b82f6', prompts: ['Debug my React useEffect running twice', 'Build a landing page for a coffee brand', 'Write a Python script to rename files by date', 'Explain this SQL query step by step'] },
  { id: 'analyse', icon: 'analyse', label: 'Analyse', color: '#f59e0b', prompts: ['Analyse Q2 vs Q3 revenue and spot trends', 'Compare three pricing strategies for a SaaS', 'Summarise the risks in this business plan', 'Analyse customer churn data for patterns'] },
  { id: 'compare', icon: 'branches', label: 'Compare', color: '#10b981', prompts: [] },
  { id: 'image', icon: 'image', label: 'Image', color: '#ec4899', prompts: ['Generate an image of a neon fox in a rainy Tokyo alley', 'Draw a minimal violet logo for a tech startup', 'Create a poster for a jazz night in Accra', 'Illustration of a floating island with waterfalls'] },
  { id: 'summarise', icon: 'doc', label: 'Summarise', color: '#14b8a6', prompts: ['Summarise this article in five bullet points', 'Summarise the key points of a meeting transcript', 'TL;DR of the latest AI news today', 'Summarise a research paper for a 12-year-old'] },
]

const PLACEHOLDERS = ['Ask anything — best model selected automatically…', 'Write a pitch for my startup…', 'Debug this TypeScript error…', 'Generate an image of a neon fox…', 'Summarise today’s AI news…']

export default function Chat() {
  const ws = useWorkspace()
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const state = location.state as { project?: string; fresh?: number } | null
  const existing = id ? ws.conversations.find((c) => c.id === id) : undefined
  const [conv, setConv] = useState<Conversation | null>(existing ?? null)
  const [busy, setBusy] = useState(false)
  const [routing, setRouting] = useState<RouteDecision | null>(null)
  const [model, setModel] = useState(ws.prefs.defaultModel)
  const abort = useRef<AbortController | null>(null)
  const convRef = useRef(conv)
  convRef.current = conv
  const list = useRef<HTMLDivElement>(null)
  const selfNav = useRef<string | null>(null)

  // Switch conversation when the URL or "New Chat" changes
  useEffect(() => {
    // Our own redirect after starting a chat — keep streaming
    if (id && id === selfNav.current) return
    selfNav.current = null
    abort.current?.abort()
    setConv(id ? (ws.conversations.find((c) => c.id === id) ?? null) : null)
    setBusy(false)
    setRouting(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, state?.fresh])

  useEffect(() => () => abort.current?.abort(), [])

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' })
  }, [conv?.messages.length, conv?.messages[conv.messages.length - 1]?.content.length, routing])

  const update = useCallback(
    (fn: (c: Conversation) => Conversation, persist = false) => {
      setConv((c) => {
        if (!c) return c
        const next = fn(c)
        if (persist) ws.saveConversation(next)
        return next
      })
    },
    [ws],
  )

  async function send(text: string) {
    const q = text.trim()
    if (!q || busy) return
    const userMsg: ChatMessage = { id: uid(), role: 'user', content: q, createdAt: Date.now() }
    let c = convRef.current
    if (!c) {
      c = { id: uid(), title: q.length > 42 ? q.slice(0, 40).trim() + '…' : q, projectId: state?.project, updatedAt: Date.now(), messages: [] }
      selfNav.current = c.id
      navigate(`/app/chat/${c.id}`, { replace: true, state: { fresh: state?.fresh, project: state?.project } })
    }
    const started = { ...c, messages: [...c.messages, userMsg] }
    setConv(started)
    convRef.current = started
    ws.saveConversation(started)

    const botId = uid()
    const decision = model === 'auto' ? api.route(q) : { modelId: model, reason: 'Chosen manually', confidence: 1 }
    const m = modelById(decision.modelId)
    const cost = m?.cost ?? 1
    if (!ws.canAfford(cost)) {
      setConv((x) => x && { ...x, messages: [...x.messages, { id: botId, role: 'assistant', content: '', blocked: true, createdAt: Date.now() }] })
      return
    }
    setBusy(true)
    abort.current = new AbortController()
    const isImage = m?.strengths.includes('images')
    try {
      await api.streamChat(q, decision.modelId, {
        signal: abort.current.signal,
        onRoute: () => {
          setRouting(decision)
        },
        onToken: (t) =>
          update((x) => {
            const has = x.messages.some((mm) => mm.id === botId)
            const msgs = has
              ? x.messages.map((mm) => (mm.id === botId ? { ...mm, content: mm.content + t } : mm))
              : [...x.messages, { id: botId, role: 'assistant' as const, content: t, modelId: decision.modelId, reason: model === 'auto' ? decision.reason : undefined, createdAt: Date.now(), image: isImage ? { hue: [262, 290, 320, 200, 18, 235][Math.floor(Math.random() * 6)], prompt: q } : undefined }]
            return { ...x, messages: msgs }
          }),
        onDone: () => {
          const tokens = 180 + Math.floor(Math.random() * 900)
          const type: UsageType = isImage ? 'image' : /news|today|latest/.test(q.toLowerCase()) ? 'search' : 'chat'
          ws.charge({ modelId: decision.modelId, credits: cost, tokens, type })
          update((x) => {
            const msg = x.messages.find((mm) => mm.id === botId)
            if (msg?.image) ws.addImage({ id: uid(), prompt: q, modelId: decision.modelId, createdAt: Date.now(), hue: msg.image.hue })
            return { ...x, messages: x.messages.map((mm) => (mm.id === botId ? { ...mm, cost, tokens } : mm)) }
          }, true)
        },
      })
    } catch {
      update((x) => x, true)
    } finally {
      setRouting(null)
      setBusy(false)
    }
  }

  // A prompt handed over from the landing page
  useEffect(() => {
    const p = params.get('prompt')
    if (p) {
      setParams({}, { replace: true })
      send(p)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const project = ws.projects.find((p) => p.id === (conv?.projectId ?? state?.project))

  return (
    <div className="ch">
      {!conv?.messages.length ? (
        <Home key={state?.fresh ?? 'home'} onSend={send} model={model} setModel={setModel} busy={busy} project={project?.name} />
      ) : (
        <>
          <div ref={list} className="ch-scroll">
            <div className="ch-thread">
              {conv.messages.map((m, i) => (
                <Bubble key={m.id} m={m} streaming={busy && i === conv.messages.length - 1 && m.role === 'assistant'} onRetry={() => send(conv.messages[i - 1]?.content ?? '')} />
              ))}
              {busy && conv.messages[conv.messages.length - 1]?.role === 'user' && <Routing decision={routing} />}
            </div>
          </div>
          <div className="ch-dock">
            <Composer onSend={send} model={model} setModel={setModel} busy={busy} onStop={() => abort.current?.abort()} />
            <p className="ch-fine">Kwoat routes every prompt to the best model. AI can make mistakes — check important info.</p>
          </div>
        </>
      )}
    </div>
  )
}

/* ---------------- Home ---------------- */

function Home({ onSend, model, setModel, busy, project }: { onSend: (t: string) => void; model: string; setModel: (m: string) => void; busy: boolean; project?: string }) {
  const { user } = useAuth()
  const root = useRef<HTMLDivElement>(null)
  const [tile, setTile] = useState<string | null>(null)
  const [draft, setDraft] = useState<{ text: string; n: number } | null>(null)
  const navigate = useNavigate()
  const sugs = useRef<HTMLDivElement>(null)
  const name = user?.name.split(' ')[0] ?? 'there'

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const split = new SplitText('.ch-hi h1 .t', { type: 'words,chars', mask: 'chars' })
      const tl = gsap.timeline({ defaults: { ease: 'kwoat' } })
      tl.from('.ch-mark .ray', { scaleY: 0, transformOrigin: '50% 100%', stagger: 0.07, duration: 0.9 })
        .from('.ch-mark', { scale: 0.6, duration: 1.1 }, 0)
        .from(split.chars, { yPercent: 110, stagger: 0.022, duration: 0.9 }, 0.2)
        .from('.ch-wave', { scale: 0, rotate: -40, duration: 0.8, ease: 'back.out(3)' }, 0.7)
        .to('.ch-hi p', { duration: 1.2, scrambleText: { text: 'What are we working on?', chars: 'lowerCase', speed: 0.6 } }, 0.5)
        .from('.ch-home .composer', { y: 40, opacity: 0, scale: 0.97, duration: 1 }, 0.45)
        .from('.ch-tile', { y: 50, opacity: 0, rotateX: -50, transformOrigin: '50% 100%', stagger: 0.06, duration: 1 }, 0.6)
      return () => split.revert()
    }, root)
    return () => ctx.revert()
  }, [])

  // Pointer-follow glow
  useEffect(() => {
    const el = root.current
    if (!el) return
    const xTo = gsap.quickTo(el, '--gx', { duration: 0.8, ease: 'power3' })
    const yTo = gsap.quickTo(el, '--gy', { duration: 0.8, ease: 'power3' })
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      xTo(e.clientX - r.left)
      yTo(e.clientY - r.top)
    }
    el.addEventListener('pointermove', move)
    return () => el.removeEventListener('pointermove', move)
  }, [])

  useLayoutEffect(() => {
    if (tile && sugs.current) gsap.fromTo(sugs.current.children, { y: 16, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.5, ease: 'kwoat' })
  }, [tile])

  const active = TILES.find((t) => t.id === tile)
  return (
    <div ref={root} className="ch-home">
      <div className="ch-aurora" aria-hidden>
        <i />
        <i />
        <i />
      </div>
      <div className="ch-grid" aria-hidden />
      <div className="ch-center">
        <div className="ch-mark" aria-hidden>
          <span className="ch-mark-glow" />
          <Mark size={46} />
        </div>
        {project && (
          <span className="ch-project">
            <Icon name="folder" size={14} /> {project}
          </span>
        )}
        <div className="ch-hi">
          <h1>
            <span className="t">
              Good {greeting()}, {name}
            </span>{' '}
            <span className="ch-wave">👋</span>
          </h1>
          <p>&nbsp;</p>
        </div>
        <Composer onSend={onSend} model={model} setModel={setModel} busy={busy} draft={draft} big />
        <div className="ch-tiles">
          {TILES.map((t) => (
            <Tile
              key={t.id}
              t={t}
              on={tile === t.id}
              onClick={() => {
                if (t.id === 'compare') return navigate('/app/compare')
                setTile((x) => (x === t.id ? null : t.id))
              }}
            />
          ))}
        </div>
        {active && (
          <div ref={sugs} className="ch-sugs" style={{ ['--c' as string]: active.color }}>
            {active.prompts.map((p) => (
              <button key={p} onClick={() => setDraft({ text: p, n: Date.now() })}>
                <Icon name={active.icon} size={15} />
                <span>{p}</span>
                <Icon name="arrowUp" size={14} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Tile({ t, on, onClick }: { t: (typeof TILES)[number]; on: boolean; onClick: () => void }) {
  const ref = useTilt<HTMLButtonElement>(9)
  return (
    <button ref={ref} className={`ch-tile ${on ? 'on' : ''} t-${t.id}`} style={{ ['--c' as string]: t.color }} onClick={onClick}>
      <span className="ch-tile-glow" aria-hidden />
      <span className="ch-tile-ico">
        <Icon name={t.icon} size={19} />
      </span>
      <b>{t.label}</b>
    </button>
  )
}

/* ---------------- Composer ---------------- */

export function Composer({ onSend, model, setModel, busy, onStop, draft, big }: { onSend: (t: string) => void; model: string; setModel: (m: string) => void; busy: boolean; onStop?: () => void; draft?: { text: string; n: number } | null; big?: boolean }) {
  const ws = useWorkspace()
  const navigate = useNavigate()
  const [text, setText] = useState('')
  const [focus, setFocus] = useState(false)
  const [picker, setPicker] = useState(false)
  const [attach, setAttach] = useState(false)
  const [rec, setRec] = useState(false)
  const ta = useRef<HTMLTextAreaElement>(null)
  const ph = usePlaceholder(!text && !focus)

  useEffect(() => {
    if (!draft) return
    setText(draft.text)
    requestAnimationFrame(() => {
      ta.current?.focus()
      grow()
    })
  }, [draft])

  const grow = () => {
    const el = ta.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(220, el.scrollHeight) + 'px'
  }

  // Fake dictation: types a phrase in while the mic "listens"
  useEffect(() => {
    if (!rec) return
    const phrase = 'Summarise the key points of my last meeting and list the action items'
    let i = 0
    const t = setInterval(() => {
      i += 2
      setText(phrase.slice(0, i))
      if (i >= phrase.length) {
        clearInterval(t)
        setRec(false)
      }
    }, 45)
    return () => clearInterval(t)
  }, [rec])

  const submit = () => {
    if (!text.trim() || busy) return
    onSend(text)
    setText('')
    if (ta.current) ta.current.style.height = 'auto'
  }

  const current = model === 'auto' ? null : modelById(model)
  return (
    <form
      className={`composer ${focus ? 'focus' : ''} ${big ? 'big' : ''} ${rec ? 'rec' : ''}`}
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <span className="composer-ring" aria-hidden />
      <div className="composer-field">
        <textarea
          ref={ta}
          value={text}
          rows={1}
          aria-label="Message"
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          onChange={(e) => {
            setText(e.target.value)
            grow()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
        />
        {!text && (
          <span className="composer-ph" aria-hidden>
            {focus ? PLACEHOLDERS[0] : ph}
            {!focus && <i className="composer-caret" />}
          </span>
        )}
      </div>
      <div className="composer-row">
        <div className="pop-anchor">
          <button type="button" className={`c-btn ${attach ? 'on' : ''}`} onClick={() => setAttach((a) => !a)} aria-label="Add">
            <Icon name="plus" />
          </button>
          {attach && (
            <PopMenu close={() => setAttach(false)} className="c-attach">
              <button type="button" className="pop-item" onClick={() => (setAttach(false), ws.toast('File upload connects to the backend'))}>
                <Icon name="clip" size={16} /> Upload a file
              </button>
              <button type="button" className="pop-item" onClick={() => (setAttach(false), navigate('/app/gallery'))}>
                <Icon name="image" size={16} /> Add from Gallery
              </button>
              <button type="button" className="pop-item" onClick={() => (setAttach(false), setText((t) => t || 'Search the web for '), ta.current?.focus())}>
                <Icon name="globe" size={16} /> Search the web
              </button>
            </PopMenu>
          )}
        </div>
        <div className="pop-anchor">
          <button type="button" className={`c-model ${picker ? 'on' : ''}`} onClick={() => setPicker((p) => !p)} aria-expanded={picker}>
            <span className="dot" style={{ background: current?.color ?? 'var(--violet-2)' }} />
            {current?.name ?? 'Auto'}
            <Icon name="chevronDown" size={14} />
          </button>
          {picker && (
            <ModelPicker
              value={model}
              hidden={ws.prefs.hidden}
              onPick={(m) => {
                setModel(m)
                setPicker(false)
              }}
              close={() => setPicker(false)}
            />
          )}
        </div>
        <div className="composer-right">
          <button type="button" className={`c-btn mic ${rec ? 'live' : ''}`} onClick={() => setRec((r) => !r)} aria-label="Voice input">
            <span className="mic-rings" aria-hidden>
              <i />
              <i />
            </span>
            <Icon name="mic" />
          </button>
          {busy ? (
            <button type="button" className="c-send stop" onClick={onStop} aria-label="Stop">
              <span className="stop-sq" />
            </button>
          ) : text.trim() ? (
            <button type="submit" className="c-send" aria-label="Send">
              <Icon name="arrowUp" />
            </button>
          ) : (
            <button type="button" className="c-voice" onClick={() => navigate('/app/voice')} aria-label="Voice live mode">
              {Array.from({ length: 5 }).map((_, i) => (
                <i key={i} style={{ animationDelay: `${i * -0.13}s` }} />
              ))}
            </button>
          )}
        </div>
      </div>
    </form>
  )
}

function PopMenu({ close, className, children }: { close: () => void; className: string; children: React.ReactNode }) {
  const ref = useDismiss<HTMLDivElement>(true, close)
  const pop = usePop<HTMLDivElement>(true, { y: 8 })
  return (
    <div ref={ref}>
      <div ref={pop} className={`ks-pop ${className}`}>
        {children}
      </div>
    </div>
  )
}

const TIER_LABEL = { standard: 'Standard', advanced: 'Advanced', premium: 'Premium' } as const

function ModelPicker({ value, hidden, onPick, close }: { value: string; hidden: string[]; onPick: (m: string) => void; close: () => void }) {
  const [q, setQ] = useState('')
  const models = MODELS.filter((m) => !hidden.includes(m.id) && (m.name + m.vendor).toLowerCase().includes(q.toLowerCase()))
  return (
    <PopMenu close={close} className="c-picker">
      <label className="c-picker-search pop-item">
        <Icon name="search" size={15} />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a model" />
      </label>
      <div className="c-picker-list">
        {!q && (
          <button type="button" className={`c-pick pop-item auto ${value === 'auto' ? 'on' : ''}`} onClick={() => onPick('auto')}>
            <span className="c-pick-ico auto">
              <Mark size={14} color="#fff" />
            </span>
            <span>
              <b>Auto</b>
              <small>Best model for each prompt</small>
            </span>
            {value === 'auto' && <Icon name="check" size={15} />}
          </button>
        )}
        {(['standard', 'advanced', 'premium'] as const).map((tier) => {
          const list = models.filter((m) => m.tier === tier)
          if (!list.length) return null
          return (
            <div key={tier}>
              <h5 className="pop-item">{TIER_LABEL[tier]}</h5>
              {list.map((m) => (
                <button type="button" key={m.id} className={`c-pick pop-item ${value === m.id ? 'on' : ''}`} onClick={() => onPick(m.id)}>
                  <span className="c-pick-ico" style={{ ['--c' as string]: m.color }}>
                    {m.vendor[0]}
                  </span>
                  <span>
                    <b>{m.name}</b>
                    <small>
                      {m.vendor} · {m.strengths[0]}
                    </small>
                  </span>
                  <em>~{m.cost} cr</em>
                  {value === m.id && <Icon name="check" size={15} />}
                </button>
              ))}
            </div>
          )
        })}
      </div>
    </PopMenu>
  )
}

function usePlaceholder(active: boolean) {
  const [text, setText] = useState(PLACEHOLDERS[0])
  useEffect(() => {
    if (!active) return
    let i = 0
    let n = PLACEHOLDERS[0].length
    let dir = -1
    let hold = 40
    const t = setInterval(() => {
      const w = PLACEHOLDERS[i]
      if (hold > 0) return void hold--
      n += dir
      if (dir < 0 && n <= 0) {
        i = (i + 1) % PLACEHOLDERS.length
        dir = 1
      } else if (dir > 0 && n >= PLACEHOLDERS[i].length) {
        dir = -1
        hold = 45
      }
      setText((dir > 0 ? PLACEHOLDERS[i] : w).slice(0, Math.max(0, n)))
    }, 38)
    return () => clearInterval(t)
  }, [active])
  return text
}

/* ---------------- Thread ---------------- */

function Routing({ decision }: { decision: RouteDecision | null }) {
  const ref = useRef<HTMLDivElement>(null)
  const [scan, setScan] = useState(0)
  const pool = MODELS.slice(0, 9)
  useEffect(() => {
    if (decision) return
    const t = setInterval(() => setScan((s) => (s + 1) % pool.length), 90)
    return () => clearInterval(t)
  }, [decision, pool.length])
  useLayoutEffect(() => {
    if (ref.current) gsap.from(ref.current, { y: 16, opacity: 0, duration: 0.5, ease: 'kwoat' })
  }, [])
  const picked = decision ? modelById(decision.modelId) : null
  return (
    <div ref={ref} className="ch-routing">
      <span className="ch-routing-mark">
        <Mark size={16} />
      </span>
      <div>
        <b>{picked ? `Routing to ${picked.name}` : 'Reading your prompt…'}</b>
        <div className="ch-routing-pool">
          {pool.map((m, i) => (
            <span key={m.id} className={`${!decision && i === scan ? 'scan' : ''} ${picked?.id === m.id ? 'pick' : ''}`} style={{ ['--c' as string]: m.color }}>
              {m.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function Bubble({ m, streaming, onRetry }: { m: ChatMessage; streaming: boolean; onRetry: () => void }) {
  const ws = useWorkspace()
  const ref = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const [vote, setVote] = useState<0 | 1 | -1>(0)
  useLayoutEffect(() => {
    if (!ref.current) return
    if (m.role === 'user') gsap.from(ref.current, { y: 30, x: 20, scale: 0.92, opacity: 0, duration: 0.6, ease: 'back.out(1.5)' })
    else gsap.from(ref.current, { y: 14, opacity: 0, duration: 0.5, ease: 'kwoat' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const model = modelById(m.modelId)

  if (m.blocked)
    return (
      <div ref={ref} className="msg blocked">
        <div className="msg-blocked card">
          <span className="msg-blocked-ico">
            <Icon name="wallet" size={20} />
          </span>
          <div>
            <b>You're out of credits for today</b>
            <p>Top up your wallet to keep going, or upgrade for monthly credits.</p>
          </div>
          <button className="k-btn primary" onClick={() => ws.openModal('topup')}>
            Top up
          </button>
        </div>
      </div>
    )

  if (m.role === 'user')
    return (
      <div ref={ref} className="msg user">
        <div className="msg-user">{m.content}</div>
      </div>
    )

  return (
    <div ref={ref} className="msg bot">
      <div className="msg-head">
        <span className="msg-av" style={{ ['--c' as string]: model?.color }}>
          <Mark size={13} color="#fff" />
        </span>
        <b>{model?.name}</b>
        {m.reason && <span className="msg-reason">{m.reason}</span>}
      </div>
      {m.image && <ImageResult hue={m.image.hue} done={!streaming} />}
      <div className="msg-body">
        <Rich text={m.content} />
        {streaming && <span className="caret" />}
      </div>
      {!streaming && (
        <div className="msg-actions">
          <button
            onClick={() => {
              navigator.clipboard?.writeText(m.content).catch(() => {})
              setCopied(true)
              setTimeout(() => setCopied(false), 1400)
            }}
            aria-label="Copy"
            className={copied ? 'ok' : ''}
          >
            <Icon name={copied ? 'check' : 'copy'} size={15} />
          </button>
          <button onClick={onRetry} aria-label="Regenerate">
            <Icon name="refresh" size={15} />
          </button>
          <button onClick={() => setVote((v) => (v === 1 ? 0 : 1))} className={vote === 1 ? 'ok' : ''} aria-label="Good response">
            <Icon name="thumb" size={15} />
          </button>
          <button onClick={() => setVote((v) => (v === -1 ? 0 : -1))} className={`down ${vote === -1 ? 'bad' : ''}`} aria-label="Bad response">
            <Icon name="thumb" size={15} />
          </button>
          {m.cost !== undefined && (
            <span className="msg-cost">
              <Icon name="bolt" size={12} /> {m.cost} cr · {m.tokens?.toLocaleString()} tokens
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function ImageResult({ hue, done }: { hue: number; done: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (done && ref.current) gsap.fromTo(ref.current.querySelector('.k-art'), { clipPath: 'inset(0 100% 0 0 round 18px)', scale: 1.15 }, { clipPath: 'inset(0 0% 0 0 round 18px)', scale: 1, duration: 1.3, ease: 'kwoat' })
  }, [done])
  return (
    <div ref={ref} className={`msg-img ${done ? 'done' : ''}`}>
      {done ? <Art hue={hue} /> : <div className="msg-img-noise" />}
      {!done && <span className="msg-img-label">Generating…</span>}
    </div>
  )
}

/** Renders `code`, **bold** and ``` fenced blocks. */
function Rich({ text }: { text: string }) {
  const parts = text.split(/```/)
  return (
    <>
      {parts.map((p, i) =>
        i % 2 ? (
          <pre key={i}>
            <code>{p.replace(/^\w+\n/, '')}</code>
          </pre>
        ) : (
          <span key={i}>
            {p.split(/(`[^`]+`|\*\*[^*]+\*\*)/).map((s, j) =>
              s.startsWith('`') ? <code key={j}>{s.slice(1, -1)}</code> : s.startsWith('**') ? <b key={j}>{s.slice(2, -2)}</b> : s,
            )}
          </span>
        ),
      )}
    </>
  )
}

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'
}
