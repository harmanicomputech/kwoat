import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { gsap } from '../lib/motion'
import { Icon, Logo, type IconName } from '../components/ui'
import { useAuth } from '../lib/store'
import { api, type Conversation } from '../api'
import '../styles/app.css'

const NAV: { to: string; icon: IconName; label: string; end?: boolean }[] = [
  { to: '/app', icon: 'chat', label: 'Chat', end: true },
  { to: '/app/compare', icon: 'compare', label: 'Compare' },
  { to: '/app/gallery', icon: 'image', label: 'Gallery' },
  { to: '/app/missions', icon: 'rocket', label: 'Missions' },
  { to: '/app/voice', icon: 'mic', label: 'Voice live' },
  { to: '/app/usage', icon: 'chart', label: 'Usage' },
]

function Counter({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const prev = useRef(value)
  useEffect(() => {
    const o = { v: prev.current }
    gsap.to(o, { v: value, duration: 0.8, ease: 'power3.out', onUpdate: () => ref.current && (ref.current.textContent = Math.round(o.v).toLocaleString()) })
    if (value < prev.current && ref.current) gsap.fromTo(ref.current, { color: '#f87171' }, { color: 'inherit', duration: 1 })
    prev.current = value
  }, [value])
  return <span ref={ref}>{value.toLocaleString()}</span>
}

export default function AppShell() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [recent, setRecent] = useState<Conversation[]>([])
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const stage = useRef<HTMLDivElement>(null)
  const shell = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.listConversations().then(setRecent)
    const ctx = gsap.context(() => {
      gsap.from('.sb', { x: -80, opacity: 0, duration: 0.9, ease: 'kwoat' })
      gsap.from('.sb-nav a', { x: -20, opacity: 0, stagger: 0.05, duration: 0.6, ease: 'kwoat', delay: 0.2 })
      gsap.from('.topbar > *', { y: -20, opacity: 0, stagger: 0.08, duration: 0.7, ease: 'kwoat', delay: 0.3 })
    }, shell)
    return () => ctx.revert()
  }, [])

  // Route transition
  useEffect(() => {
    setOpen(false)
    if (!stage.current) return
    gsap.fromTo(stage.current, { opacity: 0, y: 24, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'kwoat', clearProps: 'filter' })
  }, [location.pathname])

  if (!user) return null
  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div ref={shell} className={`shell ${open ? 'sb-open' : ''}`}>
      <aside className="sb">
        <div className="sb-top">
          <NavLink to="/" className="sb-logo" aria-label="Kwoat home">
            <Logo size={22} />
          </NavLink>
          <button className="sb-new" onClick={() => navigate('/app')} data-cursor="hover">
            <Icon name="plus" /> New chat <kbd>⌘K</kbd>
          </button>
        </div>
        <nav className="sb-nav" aria-label="App">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? 'is-active' : '')}>
              <Icon name={n.icon} /> <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sb-recent">
          <h4>Recent</h4>
          {recent.map((c) => (
            <button key={c.id} className="sb-conv" onClick={() => navigate('/app')}>
              {c.title}
            </button>
          ))}
        </div>
        <div className="sb-foot">
          <div className="sb-plan">
            <div>
              <b>{user.plan === 'free' ? 'Free & PayG' : user.plan === 'pro' ? 'Pro' : user.plan}</b>
              <small>{user.credits.standard.toLocaleString()} credits left</small>
            </div>
            <NavLink to="/#pricing" className="sb-upgrade">
              Upgrade
            </NavLink>
          </div>
          <div className="sb-user">
            <button className="sb-avatar" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-label="Account menu">
              {initials}
            </button>
            <div className="sb-user-meta">
              <b>{user.name}</b>
              <small>{user.email}</small>
            </div>
            {menu && (
              <div className="sb-menu" role="menu">
                <button role="menuitem" onClick={() => navigate('/app/usage')}>
                  <Icon name="wallet" /> Wallet & usage
                </button>
                <button
                  role="menuitem"
                  onClick={async () => {
                    await logout()
                    navigate('/')
                  }}
                >
                  <Icon name="logout" /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
      <div className="sb-scrim" onClick={() => setOpen(false)} />

      <div className="main">
        <header className="topbar">
          <button className="icon-btn sb-toggle" onClick={() => setOpen(true)} aria-label="Open sidebar">
            <Icon name="menu" />
          </button>
          <span className="chip mode-chip">
            <span className="dot pulse" style={{ color: 'var(--violet-2)' }} /> Auto mode
          </span>
          <div className="credits">
            <span className="credit">
              <i style={{ background: '#a78bfa' }} />
              Std <b><Counter value={user.credits.standard} /></b>
            </span>
            <span className="credit">
              <i style={{ background: '#60a5fa' }} />
              Adv <b><Counter value={user.credits.advanced} /></b>
            </span>
            <span className="credit">
              <i style={{ background: '#f472b6' }} />
              Prm <b><Counter value={user.credits.premium} /></b>
            </span>
            <span className="credit">
              <Icon name="image" size={14} /> <b>{user.images.used}/{user.images.limit}</b>
            </span>
          </div>
        </header>
        <div ref={stage} className="stage">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
