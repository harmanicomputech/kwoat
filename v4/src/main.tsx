import { StrictMode, Suspense, lazy, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/store'
import { Cursor } from './components/Cursor'
import { ScrollTrigger } from './lib/motion'
import './styles/base.css'

const Landing = lazy(() => import('./pages/Landing'))
const Auth = lazy(() => import('./pages/Auth'))
const AppShell = lazy(() => import('./app/AppShell'))
const Chat = lazy(() => import('./app/Chat'))
const Compare = lazy(() => import('./app/Compare'))
const Gallery = lazy(() => import('./app/Gallery'))
const Missions = lazy(() => import('./app/Missions'))
const Voice = lazy(() => import('./app/Voice'))
const Usage = lazy(() => import('./app/Usage'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Apply the saved theme before first paint
try {
  document.documentElement.dataset.theme = localStorage.getItem('kwoat4-theme') || 'light'
} catch {
  document.documentElement.dataset.theme = 'light'
}

function ScrollReset() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    ScrollTrigger.refresh()
  }, [pathname])
  return null
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth()
  const location = useLocation()
  if (!ready) return null
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />
  return <>{children}</>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <ScrollReset />
        <Cursor />
        <div className="grain" aria-hidden />
        <Suspense fallback={<div className="route-fallback" />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Auth mode="login" />} />
            <Route path="/signup" element={<Auth mode="signup" />} />
            <Route
              path="/app"
              element={
                <RequireAuth>
                  <AppShell />
                </RequireAuth>
              }
            >
              <Route index element={<Chat />} />
              <Route path="compare" element={<Compare />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="missions" element={<Missions />} />
              <Route path="voice" element={<Voice />} />
              <Route path="usage" element={<Usage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
