import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from '../lib/motion'
import { Icon } from '../components/ui'
import { useAuth } from '../lib/store'
import { Count, Modal } from './kit'
import { money, useWorkspace } from './workspace'

/* ---------------- Search (⌘K) ---------------- */

export function SearchPalette() {
  const ws = useWorkspace()
  const navigate = useNavigate()
  const open = ws.modal === 'search'
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const hl = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (open) {
      setQ('')
      setSel(0)
      setTimeout(() => input.current?.focus(), 60)
    }
  }, [open])

  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    return ws.conversations
      .map((c) => {
        const hit = c.messages.find((m) => m.content.toLowerCase().includes(s))
        return { c, snippet: hit?.content ?? c.messages[c.messages.length - 1]?.content ?? '', match: !s || c.title.toLowerCase().includes(s) || !!hit }
      })
      .filter((r) => r.match)
      .slice(0, 8)
  }, [q, ws.conversations])

  // Slide the highlight bar to the selected row
  useLayoutEffect(() => {
    const row = list.current?.querySelectorAll<HTMLElement>('.sp-row')[sel]
    if (!hl.current) return
    if (!row) return void gsap.set(hl.current, { opacity: 0 })
    gsap.to(hl.current, { y: row.offsetTop, height: row.offsetHeight, opacity: 1, duration: 0.35, ease: 'kwoat' })
  }, [sel, results.length])

  const go = (id: string) => {
    ws.openModal(null)
    navigate(`/app/chat/${id}`)
  }

  const mark = (text: string) => {
    const s = q.trim()
    if (!s) return text
    const i = text.toLowerCase().indexOf(s.toLowerCase())
    if (i < 0) return text
    const start = Math.max(0, i - 30)
    return (
      <>
        {start > 0 && '…'}
        {text.slice(start, i)}
        <mark>{text.slice(i, i + s.length)}</mark>
        {text.slice(i + s.length)}
      </>
    )
  }

  return (
    <Modal open={open} onClose={() => ws.openModal(null)} className="sp" label="Search conversations">
      <div className="sp-bar">
        <Icon name="search" />
        <input
          ref={input}
          value={q}
          placeholder="Search conversations..."
          onChange={(e) => {
            setQ(e.target.value)
            setSel(0)
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') setSel((s) => Math.min(results.length - 1, s + 1))
            if (e.key === 'ArrowUp') setSel((s) => Math.max(0, s - 1))
            if (e.key === 'Enter' && results[sel]) go(results[sel].c.id)
          }}
        />
        <kbd onClick={() => ws.openModal(null)}>ESC</kbd>
        <i className="sp-scan" aria-hidden />
      </div>
      {results.length ? (
        <div ref={list} className="sp-list k-stagger">
          <span ref={hl} className="sp-hl" aria-hidden />
          {results.map((r, i) => (
            <button key={r.c.id} className="sp-row" onMouseEnter={() => setSel(i)} onClick={() => go(r.c.id)}>
              <span className="sp-ico">
                <Icon name="chat" size={16} />
              </span>
              <span className="sp-text">
                <b>{mark(r.c.title)}</b>
                <small>{mark(r.snippet)}</small>
              </span>
              <Icon name="chevron" size={14} />
            </button>
          ))}
        </div>
      ) : (
        <div className="sp-empty k-stagger">
          <div className="sp-empty-ico">
            <Icon name="search" size={34} />
          </div>
          <b>No conversations found</b>
          <small>{ws.conversations.length ? 'Try a different search term' : 'Start a chat and it will show up here'}</small>
        </div>
      )}
      <footer className="sp-foot">
        <span>
          <kbd>↑</kbd>
          <kbd>↓</kbd> navigate
        </span>
        <span>
          <kbd>↵</kbd> open
        </span>
        <span>
          <kbd>⌘K</kbd> toggle
        </span>
      </footer>
    </Modal>
  )
}

/* ---------------- New project ---------------- */

export function NewProjectModal() {
  const ws = useWorkspace()
  const { user } = useAuth()
  const navigate = useNavigate()
  const open = ws.modal === 'project'
  const [kind, setKind] = useState<'chat' | 'mission'>('chat')
  const [name, setName] = useState('')
  const note = useRef<HTMLDivElement>(null)
  const locked = user?.plan !== 'promax'

  useEffect(() => {
    if (open) {
      setKind('chat')
      setName('')
    }
  }, [open])

  useLayoutEffect(() => {
    if (!note.current) return
    if (kind === 'mission' && locked) gsap.fromTo(note.current, { height: 0, opacity: 0, marginBottom: 0 }, { height: 'auto', opacity: 1, marginBottom: 18, duration: 0.5, ease: 'kwoat' })
    else gsap.to(note.current, { height: 0, opacity: 0, marginBottom: 0, duration: 0.35, ease: 'kwoatIn' })
  }, [kind, locked])

  const canCreate = name.trim().length > 0 && !(kind === 'mission' && locked)
  const create = () => {
    if (!canCreate) return
    const p = ws.addProject(name.trim(), kind)
    ws.openModal(null)
    ws.toast(`Project “${p.name}” created`, 'ok')
  }

  return (
    <Modal open={open} onClose={() => ws.openModal(null)} className="np" label="New project">
      <header className="np-head k-stagger">
        <h3>New project</h3>
        <p>Choose what kind of work you'll do in this project</p>
      </header>
      <div className="np-body k-stagger">
        <div className="np-kinds">
          <button className={`np-kind ${kind === 'chat' ? 'on' : ''}`} onClick={() => setKind('chat')}>
            <span className="np-kind-ico c">
              <Icon name="bubbles" size={20} />
            </span>
            <b>Chat workspace</b>
            <small>Organise conversations with shared context</small>
            <span className="np-check">
              <Icon name="check" size={13} />
            </span>
          </button>
          <button className={`np-kind ${kind === 'mission' ? 'on' : ''} ${locked ? 'locked' : ''}`} onClick={() => setKind('mission')}>
            {locked && <span className="np-badge">Pro Max</span>}
            <span className="np-kind-ico m">
              <Icon name="rocket" size={20} />
            </span>
            <b>Mission workspace</b>
            <small>Run agent tasks that build real files</small>
            <span className="np-check">
              <Icon name="check" size={13} />
            </span>
          </button>
        </div>
        <div ref={note} className="np-note" style={{ height: 0, opacity: 0 }}>
          <span>
            <Icon name="lock" size={15} /> Mission workspaces require Pro Max.
          </span>
          <button
            onClick={() => {
              ws.openModal(null)
              navigate('/app/subscription')
            }}
          >
            Upgrade →
          </button>
        </div>
        <label className="k-field">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. AI Research Hub" onKeyDown={(e) => e.key === 'Enter' && create()} />
        </label>
        <div className="np-actions">
          <button className="k-btn ghost" onClick={() => ws.openModal(null)}>
            Cancel
          </button>
          <button className="k-btn primary" disabled={!canCreate} onClick={create}>
            Create project
          </button>
        </div>
      </div>
    </Modal>
  )
}

/* ---------------- Top up ---------------- */

const AMOUNTS = [5, 20, 50, 100]

export function TopUpModal() {
  const ws = useWorkspace()
  const open = ws.modal === 'topup'
  const [pick, setPick] = useState<number | null>(5)
  const [custom, setCustom] = useState('')
  const [stage, setStage] = useState<'pick' | 'paying' | 'done'>('pick')
  const grid = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLSpanElement>(null)
  const done = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setPick(5)
      setCustom('')
      setStage('pick')
    }
  }, [open])

  // The selection ring glides between amount buttons
  useLayoutEffect(() => {
    if (!ring.current || !grid.current) return
    const btn = grid.current.querySelector<HTMLElement>(`[data-v="${pick}"]`)
    if (!btn) return void gsap.to(ring.current, { opacity: 0, scale: 0.9, duration: 0.25 })
    gsap.to(ring.current, { x: btn.offsetLeft, y: btn.offsetTop, width: btn.offsetWidth, height: btn.offsetHeight, opacity: 1, scale: 1, duration: 0.5, ease: 'kwoat' })
  }, [pick, open, stage])

  useLayoutEffect(() => {
    if (stage !== 'done' || !done.current) return
    const tl = gsap.timeline()
    tl.from(done.current.querySelector('.tu-ok'), { scale: 0, rotate: -90, duration: 0.7, ease: 'back.out(2)' })
      .from(done.current.querySelector('.tu-ok path'), { drawSVG: '0%', duration: 0.5, ease: 'power2.out' }, '-=0.3')
      .from(done.current.querySelectorAll('.tu-done-txt > *'), { y: 12, opacity: 0, stagger: 0.08, duration: 0.5, ease: 'kwoat' }, '-=0.3')
    done.current.querySelectorAll<HTMLElement>('.tu-confetti i').forEach((el, i) => {
      const a = (i / 18) * Math.PI * 2
      gsap.fromTo(el, { x: 0, y: 0, opacity: 1, scale: 1 }, { x: Math.cos(a) * (90 + Math.random() * 60), y: Math.sin(a) * (70 + Math.random() * 50) + 40, rotate: Math.random() * 360, opacity: 0, scale: 0.4, duration: 1.4 + Math.random() * 0.4, ease: 'power3.out', delay: 0.15 })
    })
  }, [stage])

  const amount = custom ? Math.max(0, Math.min(10000, parseFloat(custom) || 0)) : (pick ?? 0)

  const pay = () => {
    if (amount <= 0) return
    setStage('paying')
    setTimeout(() => {
      ws.topUp(+amount.toFixed(2))
      setStage('done')
    }, 1400)
  }

  return (
    <Modal open={open} onClose={() => ws.openModal(null)} className="tu" label="Top up wallet">
      <button className="ks-ico sm k-close" onClick={() => ws.openModal(null)} aria-label="Close">
        <Icon name="x" size={17} />
      </button>
      {stage === 'done' ? (
        <div ref={done} className="tu-done">
          <div className="tu-confetti" aria-hidden>
            {Array.from({ length: 18 }).map((_, i) => (
              <i key={i} style={{ background: ['#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'][i % 5] }} />
            ))}
          </div>
          <svg className="tu-ok" viewBox="0 0 60 60" width="76" height="76" aria-hidden>
            <circle cx="30" cy="30" r="28" />
            <path d="m18 31 8 8 16-17" />
          </svg>
          <div className="tu-done-txt">
            <h3>{money(amount)} added</h3>
            <p>
              New balance <b>{money(ws.balance)}</b>
            </p>
            <button className="k-btn primary wide" onClick={() => ws.openModal(null)}>
              Back to Kwoat
            </button>
          </div>
        </div>
      ) : (
        <div className="k-stagger tu-body">
          <header>
            <h3>Top Up Wallet</h3>
            <p>Select or enter amount to add to your wallet</p>
          </header>
          <label className="k-label">Select Amount (USD)</label>
          <div ref={grid} className="tu-grid">
            <span ref={ring} className="tu-ring" aria-hidden />
            {AMOUNTS.map((a) => (
              <button
                key={a}
                data-v={a}
                className={`tu-amt ${pick === a && !custom ? 'on' : ''}`}
                onClick={() => {
                  setPick(a)
                  setCustom('')
                }}
              >
                {money(a)}
                <small>{(a / 0.01).toLocaleString()} credits</small>
              </button>
            ))}
          </div>
          <label className="k-label">Or Enter Custom Amount (USD)</label>
          <label className="k-field">
            <input
              inputMode="decimal"
              value={custom}
              placeholder="Enter amount in USD"
              onChange={(e) => {
                setCustom(e.target.value.replace(/[^\d.]/g, ''))
                setPick(null)
              }}
            />
          </label>
          <div className="tu-total">
            <span>Amount to add:</span>
            <b>
              <Count value={amount} format={(n) => money(n)} duration={0.6} />
            </b>
          </div>
          <div className="tu-pay">
            <span>Card</span>
            <span>Apple Pay</span>
            <span>Google Pay</span>
          </div>
          <div className="np-actions">
            <button className="k-btn ghost" onClick={() => ws.openModal(null)}>
              Cancel
            </button>
            <button className={`k-btn primary ${stage === 'paying' ? 'loading' : ''}`} disabled={amount <= 0 || stage === 'paying'} onClick={pay}>
              {stage === 'paying' ? (
                <>
                  <span className="k-spin" /> Processing…
                </>
              ) : (
                'Confirm Payment'
              )}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
