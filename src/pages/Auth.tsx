import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { gsap, SplitText } from '../lib/motion'
import { Arrow, Logo, Magnetic } from '../components/ui'
import { useAuth } from '../lib/store'
import { MODELS } from '../api'
import '../styles/auth.css'

export default function Auth({ mode }: { mode: 'login' | 'signup' }) {
  const isSignup = mode === 'signup'
  const { login, signup } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const root = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const split = SplitText.create('.au-title', { type: 'chars', charsClass: 'ch' })
      gsap
        .timeline({ defaults: { ease: 'kwoat' } })
        .from('.au-art', { clipPath: 'inset(0 100% 0 0)', duration: 1.4, ease: 'expo.inOut' })
        .from(split.chars, { yPercent: 110, stagger: 0.02, duration: 1 }, 0.5)
        .from('.au-form > *', { y: 30, opacity: 0, stagger: 0.07, duration: 0.9 }, 0.6)
        .from('.au-orbit span', { scale: 0, opacity: 0, stagger: 0.05, duration: 0.8 }, 0.9)
      gsap.to('.au-orbit', { rotate: 360, duration: 60, repeat: -1, ease: 'none' })
      gsap.to('.au-orbit span', { rotate: -360, duration: 60, repeat: -1, ease: 'none' })
    }, root)
    return () => ctx.revert()
  }, [mode])

  // Liquid gradient blobs
  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const g = c.getContext('2d')!
    let raf = 0
    const blobs = [
      { h: 265, r: 0.55, s: 0.0004, o: 0 },
      { h: 300, r: 0.45, s: 0.0005, o: 2 },
      { h: 190, r: 0.35, s: 0.0003, o: 4 },
    ]
    const draw = (t: number) => {
      const w = (c.width = c.clientWidth)
      const h = (c.height = c.clientHeight)
      g.fillStyle = '#07050d'
      g.fillRect(0, 0, w, h)
      g.globalCompositeOperation = 'lighter'
      blobs.forEach((b) => {
        const x = w * (0.5 + 0.3 * Math.sin(t * b.s + b.o))
        const y = h * (0.5 + 0.3 * Math.cos(t * b.s * 1.3 + b.o))
        const rad = Math.max(w, h) * b.r
        const grd = g.createRadialGradient(x, y, 0, x, y, rad)
        grd.addColorStop(0, `hsla(${b.h}, 90%, 60%, 0.55)`)
        grd.addColorStop(1, 'transparent')
        g.fillStyle = grd
        g.fillRect(0, 0, w, h)
      })
      g.globalCompositeOperation = 'source-over'
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const email = String(f.get('email') || '')
    const password = String(f.get('password') || '')
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address.')
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    setError('')
    setBusy(true)
    try {
      if (isSignup) await signup(String(f.get('name') || ''), email, password)
      else await login(email, password)
      const prompt = params.get('prompt')
      navigate(params.get('next') || (prompt ? `/app?prompt=${encodeURIComponent(prompt)}` : '/app'))
    } catch {
      setError('Something went wrong. Please try again.')
      setBusy(false)
    }
  }

  return (
    <div ref={root} className="auth">
      <aside className="au-art">
        <canvas ref={canvas} className="au-canvas" aria-hidden />
        <Link to="/" className="au-logo" data-cursor="hover">
          <Logo />
        </Link>
        <div className="au-orbit" aria-hidden>
          {MODELS.slice(0, 9).map((m, i) => (
            <span key={m.id} style={{ ['--a' as string]: `${(i / 9) * 360}deg` }}>
              <i style={{ background: m.color }} />
              {m.name}
            </span>
          ))}
        </div>
        <div className="au-art-copy">
          <p className="serif">“One place for everything.”</p>
          <small>— Beta user</small>
        </div>
      </aside>

      <main className="au-main">
        <form className="au-form" onSubmit={submit} noValidate>
          <h1 className="au-title">{isSignup ? 'Create your account' : 'Welcome back'}</h1>
          <p className="au-sub">
            {isSignup ? '50 free credits every day. No card needed.' : 'Log in to pick up where you left off.'}
          </p>
          {params.get('prompt') && (
            <div className="au-prompt">
              Your prompt is waiting: <b>“{params.get('prompt')}”</b>
            </div>
          )}
          <button type="button" className="au-oauth" data-cursor="hover" onClick={() => setError('Google sign-in connects once the backend is live.')}>
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
              <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
            </svg>
            Continue with Google
          </button>
          <div className="au-or">
            <span>or</span>
          </div>
          {isSignup && (
            <label className="field">
              <input name="name" placeholder=" " autoComplete="name" required />
              <span>Full name</span>
            </label>
          )}
          <label className="field">
            <input name="email" type="email" placeholder=" " autoComplete="email" required />
            <span>Email</span>
          </label>
          <label className="field">
            <input name="password" type="password" placeholder=" " autoComplete={isSignup ? 'new-password' : 'current-password'} required minLength={8} />
            <span>Password</span>
          </label>
          {error && (
            <p className="au-error" role="alert">
              {error}
            </p>
          )}
          <Magnetic type="submit" className={`btn btn-primary au-submit ${busy ? 'is-busy' : ''}`} strength={0.12} disabled={busy}>
            {busy ? <span className="spinner" /> : null}
            {isSignup ? 'Create account' : 'Log in'} {!busy && <Arrow />}
          </Magnetic>
          <p className="au-switch">
            {isSignup ? 'Already have an account?' : 'New to Kwoat?'}{' '}
            <Link to={isSignup ? '/login' : '/signup'}>{isSignup ? 'Log in' : 'Create one free'}</Link>
          </p>
          <p className="au-demo">Demo mode: any email and an 8+ character password will work.</p>
        </form>
      </main>
    </div>
  )
}
