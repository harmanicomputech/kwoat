import { useLayoutEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { gsap } from '../lib/motion'
import { Icon, Mark, type IconName } from '../components/ui'
import { MODELS } from '../api'
import { useAuth, useTheme } from '../lib/store'
import { Modal } from './kit'
import { Switch } from './Usage'
import { FaqItem } from './Subscription'
import { useWorkspace, type Prefs } from './workspace'

type Tab = 'account' | 'security' | 'integrations' | 'customize' | 'notifications' | 'data' | 'help'
const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'account', label: 'Account', icon: 'bubbles' },
  { id: 'security', label: 'Access & Security', icon: 'lock' },
  { id: 'integrations', label: 'Integrations', icon: 'layers' },
  { id: 'customize', label: 'Customize', icon: 'settings' },
  { id: 'notifications', label: 'Notifications', icon: 'alert' },
  { id: 'data', label: 'Data & Control', icon: 'folder' },
  { id: 'help', label: 'Help', icon: 'chat' },
]

export default function Settings() {
  const [params, setParams] = useSearchParams()
  const tab = (TABS.find((t) => t.id === params.get('tab'))?.id ?? 'account') as Tab
  const nav = useRef<HTMLElement>(null)
  const ind = useRef<HTMLSpanElement>(null)
  const panel = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = nav.current?.querySelector<HTMLElement>('.on')
    if (el && ind.current) gsap.to(ind.current, { y: el.offsetTop, height: el.offsetHeight, opacity: 1, duration: 0.5, ease: 'kwoat' })
    if (panel.current)
      gsap.fromTo(panel.current.querySelectorAll('.st-in'), { y: 22, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.6, ease: 'kwoat' })
  }, [tab])

  return (
    <div className="st">
      <aside className="st-side">
        <div className="st-side-head">
          <h2>Settings</h2>
          <p>Manage your account</p>
        </div>
        <nav ref={nav}>
          <span ref={ind} className="st-ind" aria-hidden />
          {TABS.map((t) => (
            <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setParams({ tab: t.id })}>
              <Icon name={t.icon} size={17} />
              <span>{t.label}</span>
              <Icon name="chevron" size={14} />
            </button>
          ))}
        </nav>
      </aside>
      <div ref={panel} key={tab} className="st-panel">
        {tab === 'account' && <Account />}
        {tab === 'security' && <Security />}
        {tab === 'integrations' && <Integrations />}
        {tab === 'customize' && <Customize />}
        {tab === 'notifications' && <Notifications />}
        {tab === 'data' && <DataControl />}
        {tab === 'help' && <Help />}
      </div>
    </div>
  )
}

function Head({ title, sub }: { title: string; sub: string }) {
  return (
    <header className="st-head st-in">
      <h1>{title}</h1>
      <p>{sub}</p>
    </header>
  )
}

function Account() {
  const { user } = useAuth()
  const ws = useWorkspace()
  const [p, setP] = useState(ws.prefs.profile)
  const since = new Date(ws.prefs.memberSince).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const field = (k: keyof typeof p) => ({ value: p[k], onChange: (e: React.ChangeEvent<HTMLInputElement>) => setP({ ...p, [k]: e.target.value }) })
  return (
    <>
      <Head title="Account" sub="Your identity on Kwoat" />
      <div className="st-id st-in">
        <span className="st-avatar">
          <span className="st-avatar-ring" aria-hidden />
          {(user?.name || '?')[0].toUpperCase()}
        </span>
        <div>
          <b>{p.displayName || user?.email}</b>
          <span>{user?.email}</span>
          <small>Member since {since}</small>
        </div>
      </div>
      <div className="st-form">
        <div className="st-two st-in">
          <label className="k-field labeled">
            <span>Full name</span>
            <input placeholder="Your full name" {...field('fullName')} />
          </label>
          <label className="k-field labeled">
            <span>Display name</span>
            <input placeholder="How you appear in chat" {...field('displayName')} />
          </label>
        </div>
        <label className="k-field labeled st-in">
          <span>Email</span>
          <input value={user?.email ?? ''} disabled />
          <small>Email is managed by your auth provider</small>
        </label>
        <label className="k-field labeled st-in">
          <span>
            Phone <em>(optional)</em>
          </span>
          <input placeholder="+1 234 567 8900" {...field('phone')} />
        </label>
        <div className="st-two st-in">
          <label className="k-field labeled">
            <span>Country</span>
            <input placeholder="Detecting…" {...field('country')} />
          </label>
          <label className="k-field labeled">
            <span>Currency</span>
            <input value="USD" disabled />
          </label>
        </div>
        <p className="st-note st-in">Country and currency are detected automatically from your location.</p>
        <div className="st-in">
          <button
            className="k-btn primary shine"
            onClick={() => {
              ws.setPrefs({ profile: p })
              ws.toast('Profile saved', 'ok')
            }}
          >
            Save changes
          </button>
        </div>
      </div>
    </>
  )
}

function Row({ icon, title, sub, children, dim, badge }: { icon: IconName | React.ReactNode; title: string; sub: string; children?: React.ReactNode; dim?: boolean; badge?: React.ReactNode }) {
  return (
    <div className={`st-row ${dim ? 'dim' : ''}`}>
      <span className="st-row-ico">{typeof icon === 'string' ? <Icon name={icon as IconName} size={18} /> : icon}</span>
      <div className="st-row-txt">
        <b>
          {title} {badge}
        </b>
        <small>{sub}</small>
      </div>
      {children}
    </div>
  )
}

const Soon = () => <span className="k-badge soon">Soon</span>

function Security() {
  const { user, logout } = useAuth()
  const ws = useWorkspace()
  const navigate = useNavigate()
  const [pw, setPw] = useState(false)
  const [twofa, setTwofa] = useState(false)
  const [code, setCode] = useState('')
  return (
    <>
      <Head title="Access & Security" sub="Manage how you access your account" />
      <div className="k-card st-card st-in">
        <Row icon="lock" title="Password" sub="Change your account password">
          <button className="k-btn ghost" onClick={() => setPw(true)}>
            Change
          </button>
        </Row>
      </div>
      <div className="k-card st-card st-in">
        <Row icon="lock" title="Two-factor authentication" sub="Add an extra layer of security" />
        <div className="st-sub">
          <Row icon="card" title="Authenticator app" sub="Google Authenticator, Authy, etc." badge={<span className="k-badge">Recommended</span>}>
            <button className="k-btn ghost" onClick={() => setTwofa(true)}>
              Set up
            </button>
          </Row>
          <Row icon="doc" title="Email code" sub={`Send a one-time code to ${user?.email}`} badge={<Soon />} dim>
            <button className="k-btn ghost" disabled>
              Coming soon
            </button>
          </Row>
          <Row icon="chat" title="Text message (SMS)" sub="Requires phone number verification" badge={<Soon />} dim>
            <button className="k-btn ghost" disabled>
              Coming soon
            </button>
          </Row>
        </div>
      </div>
      <div className="k-card st-card st-in">
        <Row icon="globe" title="Active sessions" sub="Devices currently logged in">
          <button
            className="k-btn danger-ghost"
            onClick={async () => {
              await logout()
              navigate('/login')
            }}
          >
            Log out all
          </button>
        </Row>
        <div className="st-session">
          <div>
            <b>Current session</b>
            <small>{navigator.userAgent}</small>
          </div>
          <span className="st-live">
            <span className="dot pulse" /> Active now
          </span>
        </div>
      </div>

      <Modal open={pw} onClose={() => setPw(false)} className="np" label="Change password">
        <div className="np-head k-stagger">
          <h3>Change password</h3>
          <p>Use at least 8 characters with a number.</p>
        </div>
        <div className="np-body k-stagger">
          <label className="k-field">
            <input type="password" placeholder="Current password" />
          </label>
          <label className="k-field">
            <input type="password" placeholder="New password" />
          </label>
          <div className="np-actions">
            <button className="k-btn ghost" onClick={() => setPw(false)}>
              Cancel
            </button>
            <button
              className="k-btn primary"
              onClick={() => {
                setPw(false)
                ws.toast('Password updated', 'ok')
              }}
            >
              Update password
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={twofa} onClose={() => setTwofa(false)} className="np" label="Set up authenticator">
        <div className="np-head k-stagger">
          <h3>Set up authenticator app</h3>
          <p>Scan this code, then enter the 6-digit code it shows.</p>
        </div>
        <div className="np-body k-stagger">
          <div className="st-qr" aria-hidden>
            {Array.from({ length: 121 }).map((_, i) => (
              <i key={i} className={(i * 7919) % 13 < 6 || [0, 1, 2, 11, 12, 13, 22, 23, 24, 8, 9, 10, 19, 20, 21, 30, 31, 32, 88, 89, 90, 99, 100, 101, 110, 111, 112].includes(i) ? 'on' : ''} />
            ))}
            <span>
              <Mark size={20} />
            </span>
          </div>
          <div className="st-otp">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className={code.length === i ? 'cur' : ''}>
                {code[i] ?? ''}
              </span>
            ))}
            <input autoFocus inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} aria-label="6-digit code" />
          </div>
          <div className="np-actions">
            <button className="k-btn ghost" onClick={() => setTwofa(false)}>
              Cancel
            </button>
            <button
              className="k-btn primary"
              disabled={code.length < 6}
              onClick={() => {
                setTwofa(false)
                setCode('')
                ws.toast('Two-factor authentication is on', 'ok')
              }}
            >
              Verify
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

const INTEGRATIONS: { id: string; name: string; sub: string; color: string; glyph: React.ReactNode; soon?: boolean }[] = [
  { id: 'github', name: 'GitHub', sub: 'Read repos, files and code in chat', color: '#24292f', glyph: <path d="M9 19c-4 1.5-4-2-6-2.5M15 21v-3.5a3 3 0 0 0-.8-2.3c2.8-.3 5.8-1.4 5.8-6.2a4.8 4.8 0 0 0-1.3-3.3 4.5 4.5 0 0 0-.1-3.3s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.1 5.4 2.4 5.4 2.4a4.5 4.5 0 0 0-.1 3.3A4.8 4.8 0 0 0 4 9c0 4.8 3 5.9 5.8 6.2a3 3 0 0 0-.8 2.3V21" /> },
  { id: 'drive', name: 'Google Drive', sub: 'Read docs and files from Drive in chat', color: '#1a73e8', glyph: <path d="M8 3h8l6 10-4 7H6l-4-7 6-10ZM8 3l6 10h8M2 13h12l-4 7" />, soon: true },
  { id: 'notion', name: 'Notion', sub: 'Read and write Notion pages in chat', color: '#111', glyph: <path d="M5 4h11l3 3v13H5V4ZM9 8v9M9 8l6 9V8" /> },
  { id: 'linkedin', name: 'LinkedIn', sub: 'Professional profile context', color: '#0a66c2', glyph: <path d="M6 9v10M6 5v.01M10 19v-6a3 3 0 0 1 6 0v6M10 9v10" />, soon: true },
  { id: 'gmail', name: 'Gmail', sub: 'Reference emails in conversations', color: '#ea4335', glyph: <path d="M3 6h18v12H3V6Zm0 0 9 7 9-7" />, soon: true },
  { id: 'slack', name: 'Slack', sub: 'Bring Slack context into Kwoat', color: '#611f69', glyph: <path d="M8 5a2 2 0 1 1 2 2H8V5Zm8 3a2 2 0 1 1-2 2V8h2Zm-2 8a2 2 0 1 1-2-2h2v2ZM6 14a2 2 0 1 1 2-2v2H6Z" />, soon: true },
]

function Integrations() {
  const ws = useWorkspace()
  const [busy, setBusy] = useState<string | null>(null)
  const toggle = (id: string, name: string) => {
    const on = ws.prefs.integrations.includes(id)
    if (on) {
      ws.setPrefs({ integrations: ws.prefs.integrations.filter((x) => x !== id) })
      return ws.toast(`${name} disconnected`)
    }
    setBusy(id)
    setTimeout(() => {
      setBusy(null)
      ws.setPrefs({ integrations: [...ws.prefs.integrations, id] })
      ws.toast(`${name} connected`, 'ok')
    }, 1200)
  }
  return (
    <>
      <Head title="Integrations" sub="Connect your tools to use them in chat" />
      {INTEGRATIONS.map((g) => {
        const on = ws.prefs.integrations.includes(g.id)
        return (
          <div key={g.id} className={`k-card st-card st-in st-int ${on ? 'connected' : ''}`} style={{ ['--c' as string]: g.color }}>
            <Row
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {g.glyph}
                </svg>
              }
              title={g.name}
              sub={g.sub}
              badge={g.soon ? <Soon /> : on ? <span className="k-badge ok">Connected</span> : null}
              dim={g.soon}
            >
              {g.soon ? (
                <button className="k-btn ghost" disabled>
                  Coming soon
                </button>
              ) : (
                <button className={`k-btn ${on ? 'ghost' : 'ghost'} ${busy === g.id ? 'loading' : ''}`} onClick={() => toggle(g.id, g.name)} disabled={busy === g.id}>
                  {busy === g.id ? (
                    <>
                      <span className="k-spin" /> Connecting
                    </>
                  ) : on ? (
                    'Disconnect'
                  ) : (
                    'Connect'
                  )}
                </button>
              )}
            </Row>
          </div>
        )
      })}
    </>
  )
}

const FONTS: { id: Prefs['font']; label: string; sub: string; family: string }[] = [
  { id: 'system', label: 'System', sub: 'Clean & familiar', family: 'var(--font)' },
  { id: 'serif', label: 'Serif', sub: 'Classic & readable', family: 'Georgia, "Times New Roman", serif' },
  { id: 'mono', label: 'Mono', sub: 'Technical & precise', family: 'var(--mono)' },
  { id: 'humanist', label: 'Humanist', sub: 'Warm & approachable', family: '"Segoe UI", Candara, "Trebuchet MS", sans-serif' },
  { id: 'literary', label: 'Literary', sub: 'Elegant & literary', family: '"Palatino Linotype", Palatino, "Book Antiqua", serif' },
]

function Customize() {
  const ws = useWorkspace()
  const { theme, toggle } = useTheme()
  const [p, setP] = useState(ws.prefs)
  const setTheme = (t: Prefs['theme'], e: React.MouseEvent) => {
    setP({ ...p, theme: t })
    const want = t === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : t
    if (want !== theme) toggle(e)
  }
  return (
    <>
      <Head title="Customize" sub="Make Kwoat work the way you think" />
      <section className="st-group st-in">
        <h4>Theme</h4>
        <div className="st-choices three">
          {(['light', 'dark', 'system'] as const).map((t) => (
            <button key={t} className={`st-choice theme-${t} ${p.theme === t ? 'on' : ''}`} onClick={(e) => setTheme(t, e)}>
              <span className="st-theme-prev" aria-hidden>
                <i />
                <i />
                <i />
              </span>
              <Icon name={t === 'light' ? 'sun' : t === 'dark' ? 'moon' : 'compare'} size={17} />
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </section>
      <section className="st-group st-in">
        <h4>Chat message font size</h4>
        <p>Applied to chat messages only</p>
        <div className="st-choices three">
          {(['sm', 'md', 'lg'] as const).map((s) => (
            <button key={s} className={`st-choice ${p.fontSize === s ? 'on' : ''}`} onClick={() => setP({ ...p, fontSize: s })}>
              <span style={{ fontSize: s === 'sm' ? 13 : s === 'md' ? 16 : 20, fontWeight: 600 }}>Aa</span>
              {s === 'sm' ? 'Small' : s === 'md' ? 'Medium' : 'Large'}
            </button>
          ))}
        </div>
      </section>
      <section className="st-group st-in">
        <h4>Chat font style</h4>
        <p>Applied to AI responses</p>
        <div className="st-list">
          {FONTS.map((f) => (
            <button key={f.id} className={`st-opt ${p.font === f.id ? 'on' : ''}`} onClick={() => setP({ ...p, font: f.id })}>
              <span>
                <b style={{ fontFamily: f.family }}>{f.label}</b>
                <small style={{ fontFamily: f.family }}>{f.sub}</small>
              </span>
              <span className="st-tick">
                <Icon name="check" size={14} />
              </span>
            </button>
          ))}
        </div>
      </section>
      <section className="st-group st-in">
        <h4>Default model</h4>
        <p>Pre-selected when you open a new chat</p>
        <div className="st-list">
          {[{ id: 'auto', name: 'Auto', vendor: 'Best model per prompt', color: 'var(--violet)' }, ...MODELS].map((m) => (
            <button key={m.id} className={`st-opt ${p.defaultModel === m.id ? 'on' : ''}`} onClick={() => setP({ ...p, defaultModel: m.id })}>
              <span className="st-model-ico" style={{ ['--c' as string]: m.color }}>
                {m.id === 'auto' ? <Mark size={13} /> : m.vendor[0]}
              </span>
              <span>
                <b>{m.name}</b>
                <small>{m.vendor}</small>
              </span>
              <span className="st-tick">
                <Icon name="check" size={14} />
              </span>
            </button>
          ))}
        </div>
      </section>
      <section className="st-group st-in">
        <h4>Visible models in chat</h4>
        <p>Choose which models appear in your chat dropdown</p>
        <div className="st-list">
          {MODELS.map((m) => {
            const on = !p.hidden.includes(m.id)
            return (
              <div key={m.id} className="st-opt static">
                <span className="st-model-ico" style={{ ['--c' as string]: m.color }}>
                  {m.vendor[0]}
                </span>
                <span>
                  <b>{m.name}</b>
                  <small>{m.vendor}</small>
                </span>
                <Switch on={on} onChange={(v) => setP({ ...p, hidden: v ? p.hidden.filter((x) => x !== m.id) : [...p.hidden, m.id] })} />
              </div>
            )
          })}
        </div>
      </section>
      <div className="st-in st-save">
        <button
          className="k-btn primary shine"
          onClick={() => {
            ws.setPrefs(p)
            ws.toast('Preferences saved', 'ok')
          }}
        >
          Save preferences
        </button>
      </div>
    </>
  )
}

const NOTIFY: { id: keyof Prefs['notify']; title: string; sub: string; who: string }[] = [
  { id: 'credits', title: 'Low credits warning', sub: 'Get notified when your monthly credits drop below 15%', who: 'Pro & Pro Max only' },
  { id: 'wallet', title: 'Low wallet balance', sub: 'Get notified when your wallet balance drops below $0.50', who: 'Pay As You Go only' },
  { id: 'receipts', title: 'Payment receipts', sub: 'Receive email confirmation for every wallet top-up', who: 'All plans' },
  { id: 'product', title: 'Product updates', sub: 'New features, model additions, and important announcements', who: 'All plans' },
]

function Notifications() {
  const ws = useWorkspace()
  const [n, setN] = useState(ws.prefs.notify)
  return (
    <>
      <Head title="Notifications" sub="Control which emails Kwoat sends you" />
      {NOTIFY.map((x) => (
        <div key={x.id} className={`k-card st-card st-in st-notify ${n[x.id] ? 'on' : ''}`}>
          <div className="st-row-txt">
            <b>{x.title}</b>
            <small>{x.sub}</small>
            <em>{x.who}</em>
          </div>
          <Switch on={n[x.id]} onChange={(v) => setN({ ...n, [x.id]: v })} />
        </div>
      ))}
      <div className="st-in st-save">
        <button
          className="k-btn primary shine"
          onClick={() => {
            ws.setPrefs({ notify: n })
            ws.toast('Notification preferences saved', 'ok')
          }}
        >
          Save preferences
        </button>
      </div>
    </>
  )
}

function DataControl() {
  const ws = useWorkspace()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [confirm, setConfirm] = useState<null | 'chats' | 'account'>(null)
  const [typed, setTyped] = useState('')
  const exportData = () => {
    const blob = new Blob([JSON.stringify({ conversations: ws.conversations, projects: ws.projects }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'kwoat-export.json'
    a.click()
    URL.revokeObjectURL(a.href)
    ws.toast('Export downloaded', 'ok')
  }
  return (
    <>
      <Head title="Data & Control" sub="Your data, your rules" />
      <div className="k-card st-card st-in">
        <Row icon="download" title="Export my data" sub="Download all your chats as JSON">
          <button className="k-btn ghost" onClick={exportData}>
            Export
          </button>
        </Row>
      </div>
      <div className="k-card st-card st-in">
        <Row icon="folder" title="Archived chats" sub="View and restore archived conversations" dim>
          <button className="k-btn ghost" disabled>
            Coming soon
          </button>
        </Row>
      </div>
      <div className="k-card st-card st-in">
        <Row icon="globe" title="Shared links" sub="Manage publicly shared conversations" dim>
          <button className="k-btn ghost" disabled>
            Coming soon
          </button>
        </Row>
      </div>
      <div className="k-card st-card st-in">
        <Row icon="lock" title="Memory settings" sub="Control what Kwoat remembers about you">
          <button className="k-btn ghost" onClick={() => ws.toast('Memory is empty — Kwoat has not saved anything yet')}>
            Manage
          </button>
        </Row>
      </div>
      <div className="st-danger st-in">
        <h4>
          <Icon name="alert" size={17} /> Danger zone
        </h4>
        <div className="st-danger-row">
          <div>
            <b>Delete all chats</b>
            <small>Permanently remove all conversations</small>
          </div>
          <button className="k-btn danger-ghost" onClick={() => setConfirm('chats')}>
            Delete all
          </button>
        </div>
        <div className="st-danger-row">
          <div>
            <b>Delete account</b>
            <small>Permanently delete your account and all data</small>
          </div>
          <button className="k-btn danger" onClick={() => setConfirm('account')}>
            Delete account
          </button>
        </div>
      </div>
      <Modal open={!!confirm} onClose={() => (setConfirm(null), setTyped(''))} className="np danger" label="Confirm">
        <div className="np-head k-stagger">
          <h3>{confirm === 'chats' ? 'Delete all chats?' : 'Delete your account?'}</h3>
          <p>This can’t be undone. Type DELETE to confirm.</p>
        </div>
        <div className="np-body k-stagger">
          <label className="k-field">
            <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="DELETE" autoFocus />
          </label>
          <div className="np-actions">
            <button className="k-btn ghost" onClick={() => (setConfirm(null), setTyped(''))}>
              Cancel
            </button>
            <button
              className="k-btn danger"
              disabled={typed !== 'DELETE'}
              onClick={async () => {
                if (confirm === 'chats') {
                  ws.conversations.forEach((c) => ws.deleteConversation(c.id))
                  ws.toast('All chats deleted')
                } else {
                  ws.reset()
                  await logout()
                  navigate('/')
                }
                setConfirm(null)
                setTyped('')
              }}
            >
              {confirm === 'chats' ? 'Delete all chats' : 'Delete account'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

const HELP = [
  ['How does Auto mode pick a model?', 'Kwoat reads your prompt and sends it to the model that is strongest for that kind of task — code, writing, analysis, images or current events — at the lowest cost that does the job well.'],
  ['Can I choose a model myself?', 'Yes. Use the model menu next to the + button in the message box, or set a default under Settings → Customize.'],
  ['Where are my generated images?', 'Every image you generate in chat is saved to More → Gallery.'],
  ['How do I top up?', 'Open More → Wallet and choose Add funds. Cards, Apple Pay and Google Pay are supported.'],
]

function Help() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <>
      <Head title="Help" sub="Answers to common questions, or talk to us" />
      <div className="k-card st-card st-in sub-faq">
        {HELP.map(([q, a], i) => (
          <FaqItem key={q} q={q} a={a} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
        ))}
      </div>
      <div className="k-card st-card st-in">
        <Row icon="chat" title="Contact support" sub="We usually reply within a few hours">
          <a className="k-btn primary" href="mailto:support@kwoat.ai">
            Email us
          </a>
        </Row>
      </div>
    </>
  )
}
