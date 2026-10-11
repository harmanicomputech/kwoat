import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, type User } from '../api'

type Theme = 'dark' | 'light'

function readTheme(): Theme {
  try {
    return (localStorage.getItem('kwoat4-theme') as Theme) || 'light'
  } catch {
    return 'light'
  }
}

/**
 * Theme state shared through the <html data-theme> attribute. Toggling uses the
 * View Transitions API: the new theme spreads out in a circle from the click.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readTheme)
  useEffect(() => {
    const html = document.documentElement
    html.dataset.theme = theme
    const mo = new MutationObserver(() => setTheme((html.dataset.theme as Theme) || 'light'))
    mo.observe(html, { attributes: true, attributeFilter: ['data-theme'] })
    return () => mo.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const apply = (t: Theme) => {
    document.documentElement.dataset.theme = t
    try {
      localStorage.setItem('kwoat4-theme', t)
    } catch {
      /* storage blocked — theme just won't persist */
    }
    setTheme(t)
  }

  const toggle = (e?: { clientX: number; clientY: number }) => {
    const next: Theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } }
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!doc.startViewTransition || reduced) return apply(next)
    const x = e?.clientX ?? window.innerWidth - 40
    const y = e?.clientY ?? 40
    const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
    const vt = doc.startViewTransition(() => apply(next))
    vt.ready.then(() =>
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 800, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' },
      ),
    )
  }
  return { theme, toggle }
}

interface AuthState {
  user: User | null
  ready: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  spend: (credits: number) => void
}

const AuthContext = createContext<AuthState | null>(null)

const DEMO_KEY = 'kwoat4-demo-user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // The mock keeps no session, so remember the demo user locally between reloads.
    api.me().then((u) => {
      if (u) setUser(u)
      else {
        try {
          const saved = localStorage.getItem(DEMO_KEY)
          if (saved) setUser(JSON.parse(saved))
        } catch {
          /* ignore */
        }
      }
      setReady(true)
    })
  }, [])

  useEffect(() => {
    // Wait until the saved user has been read back, or the first run would erase it
    if (!ready) return
    try {
      if (user) localStorage.setItem(DEMO_KEY, JSON.stringify(user))
      else localStorage.removeItem(DEMO_KEY)
    } catch {
      /* ignore */
    }
  }, [user, ready])

  const login = useCallback(async (email: string, password: string) => setUser(await api.login(email, password)), [])
  const signup = useCallback(
    async (name: string, email: string, password: string) => setUser(await api.signup(name, email, password)),
    [],
  )
  const logout = useCallback(async () => {
    await api.logout()
    setUser(null)
  }, [])
  const spend = useCallback(
    (n: number) =>
      setUser((u) => (u ? { ...u, credits: { ...u.credits, standard: Math.max(0, u.credits.standard - n) } } : u)),
    [],
  )

  const value = useMemo(() => ({ user, ready, login, signup, logout, spend }), [user, ready, login, signup, logout, spend])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
