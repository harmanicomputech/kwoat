import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { gsap } from '../lib/motion'
import { Icon, Mark } from '../components/ui'
import { SplitFlap } from '../components/SplitFlap'
import { useAuth, useTheme } from '../lib/store'
import { api, type Conversation } from '../api'
import '../styles/app.css'

const NAV = [
  { to: '/app', icon: 'chat', label: 'Chat', n: '01', end: true },
  { to: '/app/compare', icon: 'compare', label: 'Compare', n: '02' },
  { to: '/app/gallery', icon: 'image', label: 'Gallery', n: '03' },
  { to: '/app/missions', icon: 'rocket', label: 'Missions', n: '04' },
  { to: '/app/voice', icon: 'mic', label: 'Voice', n: '05' },
  { to: '/app/usage', icon: 'chart', label: 'Usage', n: '06' },
] as const

export default function AppShell() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [recent, setRecent] = useState<Conversation[]>([])
  const [open, setOpen] = useState(false)
  const stage = useRef<HTMLDivElement>(null)
  const shell = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.listConversations().then(setRecent)
    const ctx = gsap.context(() => {
      gsap.from('.rail', { xPercent: -100, duration: 1.1, ease: 'kwoat' })
      gsap.from('.rail-nav a', { x: -16, opacity: 0, stagger: 0.05, duration: 0.8, ease: 'kwoat', delay: 0.25 })
      gsap.from('.strip > *', { y: -12, opacity: 0, stagger: 0.06, duration: 0.8, ease: 'kwoat', delay: 0.3 })
    }, shell)
    return () => ctx.revert()
  }, [])

  useEffect(() => {
    setOpen(false)
    if (stage.current)
      gsap.fromTo(stage.current, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'expo.inOut', clearProps: 'clipPath' })
  }, [location.pathname])

  if (!user) return null
  const current = NAV.find((n) => (n.to === '/app' ? location.pathname === '/app' : location.pathname.startsWith(n.to)))

  return (
    <div ref={shell} className={`shell ${open ? 'rail-open' : ''}`}>
      <aside className="rail">
        <NavLink to="/" className="rail-brand" aria-label="Kwoat home">
          <Mark size={24} />
          <span>Kwoat</span>
        </NavLink>
        <button className="rail-new" onClick={() => navigate('/app')}>
          <Icon name="plus" /> New chat <kbd>⌘K</kbd>
        </button>
        <nav className="rail-nav" aria-label="App">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={'end' in n} className={({ isActive }) => (isActive ? 'is-on' : '')}>
              <span className="label">{n.n}</span>
              <Icon name={n.icon} />
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="rail-recent">
          <span className="label">Recent</span>
          {recent.map((c) => (
            <button key={c.id} onClick={() => navigate('/app')}>
              {c.title}
            </button>
          ))}
        </div>
        <div className="rail-foot">
          <div className="rail-plan">
            <span className="label">
              Plan · <b>{user.plan === 'pro' ? 'Pro' : user.plan === 'free' ? 'Free & PayG' : user.plan}</b>
            </span>
            <NavLink to="/#pricing" className="label rail-up">
              Upgrade →
            </NavLink>
          </div>
          <div className="rail-user">
            <span className="rail-av">{user.name.slice(0, 1).toUpperCase()}</span>
            <span className="rail-who">
              <b>{user.name}</b>
              <small>{user.email}</small>
            </span>
            <button className="rail-ic" onClick={toggle} aria-label="Toggle theme">
              <Icon name={theme === 'light' ? 'moon' : 'sun'} />
            </button>
            <button
              className="rail-ic"
              onClick={async () => {
                await logout()
                navigate('/')
              }}
              aria-label="Log out"
            >
              <Icon name="logout" />
            </button>
          </div>
        </div>
      </aside>
      <div className="rail-scrim" onClick={() => setOpen(false)} />

      <div className="main">
        <header className="strip">
          <button className="rail-toggle" onClick={() => setOpen(true)} aria-label="Open menu">
            <Icon name="menu" />
          </button>
          <span className="label strip-where">
            <b>{current?.n}</b> — {current?.label}
          </span>
          <span className="label strip-mode">
            <span className="led ok" /> Auto routing
          </span>
          <div className="strip-credits">
            <span className="label">Std</span>
            <SplitFlap value={user.credits.standard.toLocaleString('en-US')} length={5} className="flap-strip" stagger={0} speed={20} />
            <span className="label">Adv</span>
            <SplitFlap value={user.credits.advanced.toLocaleString('en-US')} length={5} className="flap-strip" stagger={0} speed={20} />
            <span className="label">Img</span>
            <SplitFlap value={`${user.images.used}/${user.images.limit}`} length={5} className="flap-strip" stagger={0} speed={20} />
          </div>
        </header>
        <div ref={stage} className="stage">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
