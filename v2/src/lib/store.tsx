import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, type User } from '../api'

type Theme = 'dark' | 'light'

function readTheme(): Theme {
  try {
    return (localStorage.getItem('kwoat2-theme') as Theme) || 'light'
  } catch {
    return 'light'
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readTheme)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('kwoat2-theme', theme)
    } catch {
      /* storage blocked — theme just won't persist */
    }
  }, [theme])
  return { theme, toggle: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')) }
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

const DEMO_KEY = 'kwoat2-demo-user'

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
