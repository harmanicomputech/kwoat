import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { gsap } from '../lib/motion'
import { Icon, Logo, Mark, type IconName } from '../components/ui'
import { useAuth, useTheme } from '../lib/store'
import { WorkspaceProvider, useWorkspace, money, type Conversation } from './workspace'
import { Count, useDismiss, usePop } from './kit'
import { NewProjectModal, SearchPalette, TopUpModal } from './overlays'
import '../styles/app.css'
import '../styles/shell.css'

export default function AppShell() {
  return (
    <WorkspaceProvider>
      <Shell />
    </WorkspaceProvider>
  )
}

const MORE: { to: string; icon: IconName; label: string }[] = [
  { to: '/app/gallery', icon: 'image', label: 'Gallery' },
  { to: '/app/wallet', icon: 'wallet', label: 'Wallet' },
  { to: '/app/usage', icon: 'chart', label: 'Usage' },
]

function Shell() {
  const { user } = useAuth()
  const ws = useWorkspace()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('kwoat4-sb') === '1')
  const [drawer, setDrawer] = useState(false)
  const shell = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      localStorage.setItem('kwoat4-sb', collapsed ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [collapsed])

  // Entrance
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'kwoat' } })
      tl.fromTo('.ks-sb', { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, clearProps: 'transform,opacity' })
        .fromTo('.ks-sb [data-in]', { x: -16, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.045, duration: 0.6, clearProps: 'transform,opacity' }, 0.15)
        .fromTo('.ks-top > *', { y: -14, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.6, clearProps: 'transform,opacity' }, 0.25)
    }, shell)
    return () => ctx.revert()
  }, [])

  // Route transition
  useEffect(() => {
    setDrawer(false)
    if (stage.current) gsap.fromTo(stage.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6, ease: 'kwoat', clearProps: 'transform' })
  }, [location.pathname])

  // ⌘K / Ctrl+K opens search
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        ws.openModal('search')
      }
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [ws])

  if (!user) return null

  return (
    <div ref={shell} data-fs={ws.prefs.fontSize} data-font={ws.prefs.font} className={`ks ${collapsed ? 'is-collapsed' : ''} ${drawer ? 'drawer-open' : ''}`}>
      <Sidebar collapsed={collapsed} onCollapse={() => setCollapsed((c) => !c)} />
      <div className="ks-scrim" onClick={() => setDrawer(false)} />
      <main className="ks-main">
        <TopBar onMenu={() => setDrawer(true)} />
        <WalletBanner />
        <div ref={stage} className="ks-stage">
          <Outlet />
        </div>
      </main>
      <SearchPalette />
      <NewProjectModal />
      <TopUpModal />
      <Toasts />
    </div>
  )
}

/* ---------------- Sidebar ---------------- */

function Sidebar({ collapsed, onCollapse }: { collapsed: boolean; onCollapse: () => void }) {
  const { user } = useAuth()
  const ws = useWorkspace()
  const navigate = useNavigate()
  const location = useLocation()
  const nav = useRef<HTMLElement>(null)
  const ind = useRef<HTMLSpanElement>(null)
  const [more, setMore] = useState(false)
  const [account, setAccount] = useState(false)

  // Slide the active-item highlight to whichever row matches the route
  useLayoutEffect(() => {
    const el = nav.current?.querySelector<HTMLElement>('.is-active')
    if (!ind.current) return
    if (!el) return void gsap.to(ind.current, { opacity: 0, duration: 0.2 })
    const y = el.getBoundingClientRect().top - nav.current!.getBoundingClientRect().top
    gsap.to(ind.current, { y, height: el.offsetHeight, opacity: 1, duration: 0.55, ease: 'kwoat' })
  }, [location.pathname, collapsed])

  const inMore = MORE.some((m) => location.pathname.startsWith(m.to))
  const free = user?.plan === 'free'
  const first = (user?.name || user?.email || '?').trim()

  return (
    <aside className="ks-sb">
      <div className="ks-sb-head" data-in>
        <NavLink to="/" className="ks-logo" aria-label="Kwoat home">
          <Logo size={26} withWord={!collapsed} />
        </NavLink>
        <button className="ks-ico" onClick={onCollapse} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} data-tip={collapsed ? 'Expand' : undefined}>
          <Icon name="sidebar" />
        </button>
      </div>

      <div className="ks-sb-scroll">
        {free && (
          <button className="ks-upgrade" data-in onClick={() => navigate('/app/subscription')} data-tip="Upgrade">
            <span className="ks-upgrade-ring" aria-hidden />
            <Icon name="crown" size={16} />
            <span className="lbl">
              Upgrade <em>· from $6.99/mo</em>
            </span>
            <span className="lbl ks-upgrade-arrow">
              <Icon name="send" size={14} />
            </span>
          </button>
        )}

        <button className="ks-new" data-in onClick={() => navigate('/app/chat', { state: { fresh: Date.now() } })} data-tip="New chat">
          <span className="ks-new-shine" aria-hidden />
          <Icon name="plus" />
          <span className="lbl">New Chat</span>
        </button>

        <nav ref={nav} className="ks-nav" aria-label="App">
          <span ref={ind} className="ks-ind" aria-hidden />
          <NavLink to="/app/missions" className={({ isActive }) => `ks-row ${isActive ? 'is-active' : ''}`} data-in data-tip="Missions">
            <span className="ks-row-ico rocket">
              <Icon name="rocket" />
            </span>
            <span className="lbl">Missions</span>
          </NavLink>
          <button className="ks-row" onClick={() => ws.openModal('search')} data-in data-tip="Search chats">
            <span className="ks-row-ico">
              <Icon name="search" />
            </span>
            <span className="lbl">Search chats</span>
            <kbd className="lbl">⌘K</kbd>
          </button>
          <div className="ks-more-wrap">
            <button className={`ks-row ${inMore ? 'is-active' : ''} ${more ? 'is-open' : ''}`} onClick={() => setMore((m) => !m)} aria-expanded={more} data-in data-tip="More">
              <span className="ks-row-ico">
                <Icon name="dots" />
              </span>
              <span className="lbl">More</span>
              <span className="lbl ks-chev">
                <Icon name="chevron" size={15} />
              </span>
            </button>
            {more && <MoreMenu close={() => setMore(false)} />}
          </div>
        </nav>

        <Projects />
        <Conversations />
      </div>

      <div className="ks-sb-foot">
        <button className={`ks-me ${account ? 'is-open' : ''}`} onClick={() => setAccount((a) => !a)} aria-expanded={account}>
          <span className="ks-avatar">{first[0]?.toUpperCase()}</span>
          <span className="lbl ks-me-name">{first}</span>
          <span className="lbl ks-wallet-chip" onClick={(e) => (e.stopPropagation(), navigate('/app/wallet'))}>
            <Icon name="wallet" size={13} />
            <Count value={ws.balance} format={(n) => money(n)} />
          </span>
        </button>
        {account && <AccountMenu close={() => setAccount(false)} />}
      </div>
    </aside>
  )
}

function MoreMenu({ close }: { close: () => void }) {
  const navigate = useNavigate()
  const c = useCallback(close, [close])
  const ref = useDismiss<HTMLDivElement>(true, c)
  const pop = usePop<HTMLDivElement>(true, { x: -10 })
  return (
    <div ref={ref}>
      <div ref={pop} className="ks-pop ks-more" role="menu">
        {MORE.map((m) => (
          <button
            key={m.to}
            role="menuitem"
            className="pop-item"
            onClick={() => {
              navigate(m.to)
              close()
            }}
          >
            <Icon name={m.icon} size={17} /> {m.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function AccountMenu({ close }: { close: () => void }) {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const ref = useDismiss<HTMLDivElement>(true, close)
  const pop = usePop<HTMLDivElement>(true, { y: 10 })
  const go = (tab: string) => {
    navigate(`/app/settings?tab=${tab}`)
    close()
  }
  const plan = user?.plan === 'free' ? 'Free Plan' : user?.plan === 'promax' ? 'Pro Max' : user?.plan === 'pro' ? 'Pro' : 'Starter'
  return (
    <div ref={ref}>
      <div ref={pop} className="ks-pop ks-account" role="menu">
        <div className="ks-acc-head pop-item">
          <span className="ks-avatar lg">{(user?.name || '?')[0].toUpperCase()}</span>
          <div>
            <b>{user?.email}</b>
            <small>{plan}</small>
          </div>
        </div>
        <button role="menuitem" className="pop-item" onClick={() => go('account')}>
          <Icon name="bubbles" size={17} /> Account
        </button>
        <button role="menuitem" className="pop-item" onClick={() => go('customize')}>
          <Icon name="settings" size={17} /> Settings
        </button>
        <button role="menuitem" className="pop-item" onClick={() => (navigate('/app/subscription'), close())}>
          <Icon name="card" size={17} /> Subscription
        </button>
        <button role="menuitem" className="pop-item" onClick={() => go('help')}>
          <Icon name="alert" size={17} /> Help
        </button>
        <button role="menuitem" className="pop-item" onClick={(e) => toggle(e)}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={17} /> {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
        <button
          role="menuitem"
          className="pop-item danger"
          onClick={async () => {
            await logout()
            navigate('/')
          }}
        >
          <Icon name="logout" size={17} /> Log out
        </button>
      </div>
    </div>
  )
}

function Projects() {
  const ws = useWorkspace()
  const navigate = useNavigate()
  const list = useRef<HTMLDivElement>(null)
  const count = useRef(ws.projects.length)
  useLayoutEffect(() => {
    if (ws.projects.length > count.current && list.current?.firstElementChild)
      gsap.from(list.current.firstElementChild, { height: 0, opacity: 0, x: -20, duration: 0.7, ease: 'kwoat' })
    count.current = ws.projects.length
  }, [ws.projects.length])
  return (
    <section className="ks-sec">
      <header data-in>
        <span className="lbl">Projects</span>
        <button className="ks-ico sm" onClick={() => ws.openModal('project')} aria-label="New project" data-tip="New project">
          <Icon name="plus" size={16} />
        </button>
      </header>
      <div ref={list}>
        {ws.projects.map((p) => (
          <button key={p.id} className="ks-row sm" onClick={() => navigate('/app/chat', { state: { project: p.id, fresh: Date.now() } })} data-tip={p.name}>
            <span className="ks-row-ico">
              <Icon name={p.kind === 'mission' ? 'rocket' : 'folder'} size={16} />
            </span>
            <span className="lbl">{p.name}</span>
          </button>
        ))}
      </div>
      <button className="ks-add lbl" onClick={() => ws.openModal('project')} data-in>
        + New project
      </button>
    </section>
  )
}

function group(c: Conversation) {
  const d = new Date(c.updatedAt)
  const now = new Date()
  const days = Math.floor((new Date(now.toDateString()).getTime() - new Date(d.toDateString()).getTime()) / 864e5)
  return days <= 0 ? 'Today' : days === 1 ? 'Yesterday' : days < 7 ? 'Previous 7 days' : 'Older'
}

function Conversations() {
  const ws = useWorkspace()
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  const activeId = id ?? location.pathname.split('/app/chat/')[1]
  const groups = new Map<string, Conversation[]>()
  ws.conversations.filter((c) => !c.projectId).forEach((c) => groups.set(group(c), [...(groups.get(group(c)) ?? []), c]))
  ws.conversations.filter((c) => c.projectId).forEach((c) => {
    const p = ws.projects.find((x) => x.id === c.projectId)
    const k = p ? `Project · ${p.name}` : group(c)
    groups.set(k, [...(groups.get(k) ?? []), c])
  })

  if (!ws.conversations.length)
    return (
      <p className="ks-none lbl" data-in>
        No conversations yet
      </p>
    )
  return (
    <section className="ks-convs">
      {[...groups].map(([g, list]) => (
        <div key={g} className="ks-sec">
          <header>
            <span className="lbl">{g}</span>
          </header>
          {list.map((c) => (
            <div key={c.id} className={`ks-conv ${activeId === c.id ? 'is-active' : ''}`}>
              <button className="ks-conv-open" onClick={() => navigate(`/app/chat/${c.id}`)} title={c.title}>
                <span className="lbl">{c.title}</span>
              </button>
              <button
                className="ks-conv-del lbl"
                aria-label="Delete conversation"
                onClick={() => {
                  ws.deleteConversation(c.id)
                  ws.toast('Conversation deleted')
                  if (activeId === c.id) navigate('/app/chat')
                }}
              >
                <Icon name="trash" size={14} />
              </button>
            </div>
          ))}
        </div>
      ))}
    </section>
  )
}

/* ---------------- Top bar & banner ---------------- */

function TopBar({ onMenu }: { onMenu: () => void }) {
  const ws = useWorkspace()
  const { theme, toggle } = useTheme()
  const pct = ws.creditsLeft / ws.daily.limit
  return (
    <header className="ks-top">
      <button className="ks-ico ks-burger" onClick={onMenu} aria-label="Open sidebar">
        <Icon name="menu" />
      </button>
      <span className="ks-auto">
        <span className="ks-auto-orbit" aria-hidden>
          <i />
        </span>
        Auto mode
      </span>
      <div className="ks-top-right">
        <span className={`ks-credits ${pct < 0.2 ? 'low' : ''}`} title="Free credits left today">
          <svg viewBox="0 0 36 36" className="ks-credits-ring" aria-hidden>
            <circle cx="18" cy="18" r="15" />
            <circle cx="18" cy="18" r="15" className="v" style={{ strokeDashoffset: 94.2 * (1 - pct) }} />
          </svg>
          <Icon name="bolt" size={14} />
          <b>
            <Count value={ws.creditsLeft} />
          </b>
          <span>/ {ws.daily.limit} credits</span>
        </span>
        <button className="ks-ico" onClick={(e) => toggle(e)} aria-label="Toggle theme">
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
        </button>
      </div>
    </header>
  )
}

function WalletBanner() {
  const ws = useWorkspace()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [hidden, setHidden] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const show = ws.balance <= 0 && user?.plan === 'free' && !hidden
  useLayoutEffect(() => {
    if (show && ref.current) gsap.from(ref.current, { height: 0, opacity: 0, duration: 0.7, ease: 'kwoat', delay: 0.6 })
  }, [show])
  if (!show) return null
  const dismiss = () => gsap.to(ref.current, { height: 0, opacity: 0, duration: 0.45, ease: 'kwoatIn', onComplete: () => setHidden(true) })
  return (
    <div ref={ref} className="ks-banner" role="status">
      <div className="ks-banner-in">
        <span className="ks-banner-ico">
          <Icon name="alert" size={17} />
        </span>
        <p>
          Wallet empty — <button onClick={() => ws.openModal('topup')}>top up</button> to continue, or{' '}
          <button onClick={() => navigate('/app/subscription')}>upgrade to Starter</button> for monthly credits.
        </p>
        <button className="ks-ico sm" onClick={dismiss} aria-label="Dismiss">
          <Icon name="x" size={15} />
        </button>
      </div>
    </div>
  )
}

function Toasts() {
  const { toasts } = useWorkspace()
  return (
    <div className="ks-toasts" aria-live="polite">
      {toasts.map((t) => (
        <ToastItem key={t.id} text={t.text} tone={t.tone} />
      ))}
    </div>
  )
}

function ToastItem({ text, tone }: { text: string; tone?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (!ref.current) return
    gsap.fromTo(ref.current, { y: 30, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)' })
    gsap.to(ref.current, { y: 10, opacity: 0, duration: 0.4, delay: 3.1, ease: 'power2.in' })
  }, [])
  return (
    <div ref={ref} className={`ks-toast ${tone ?? ''}`}>
      <span className="ks-toast-mark">
        <Mark size={14} color="#fff" />
      </span>
      {text}
    </div>
  )
}
