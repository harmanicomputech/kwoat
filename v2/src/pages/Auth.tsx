import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { gsap, SplitText } from '../lib/motion'
import { Btn, Wordmark } from '../components/ui'
import { DitherField } from '../components/DitherField'
import { SplitFlap } from '../components/SplitFlap'
import { useAuth } from '../lib/store'
import '../styles/auth.css'

const TICKER = ['CLAUDE SONNET 4.6', 'GPT-5.4', 'GEMINI 3.1 PRO', 'GROK 4.20', 'FLUX.2 KLEIN', 'LLAMA 3.3 70B']

export default function Auth({ mode }: { mode: 'login' | 'signup' }) {
  const isSignup = mode === 'signup'
  const { login, signup } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [tick, setTick] = useState(0)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2200)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const split = SplitText.create('.au-h', { type: 'chars', charsClass: 'ch', mask: 'chars' })
      gsap
        .timeline({ defaults: { ease: 'kwoat' } })
        .from('.au-art', { clipPath: 'inset(0 0 0 100%)', duration: 1.4, ease: 'expo.inOut' })
        .from(split.chars, { yPercent: 105, stagger: 0.02, duration: 1.2 }, 0.3)
        .from('.au-form > *', { y: 24, opacity: 0, stagger: 0.06, duration: 1 }, 0.45)
    }, root)
    return () => ctx.revert()
  }, [mode])

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const email = String(f.get('email') || '')
    const password = String(f.get('password') || '')
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Enter a valid email address.')
    if (password.length < 8) return setError('Password needs at least 8 characters.')
    setError('')
    setBusy(true)
    try {
      if (isSignup) await signup(String(f.get('name') || ''), email, password)
      else await login(email, password)
      const prompt = params.get('prompt')
      navigate(params.get('next') || (prompt ? `/app?prompt=${encodeURIComponent(prompt)}` : '/app'))
    } catch {
      setError('Something went wrong. Try again.')
      setBusy(false)
    }
  }

  return (
    <div ref={root} className="auth">
      <main className="au-main">
        <Link to="/" className="au-brand" aria-label="Kwoat home">
          <Wordmark />
        </Link>
        <form className="au-form" onSubmit={submit} noValidate>
          <span className="label">
            <b>{isSignup ? '01' : '02'}</b> — {isSignup ? 'New account' : 'Sign in'}
          </span>
          <h1 className="au-h display">{isSignup ? 'Start doing.' : 'Welcome back.'}</h1>
          <p className="au-sub">{isSignup ? '50 free credits every day. No card needed.' : 'Pick up exactly where you left off.'}</p>
          {params.get('prompt') && (
            <p className="au-prompt">
              <span className="label">Waiting in your inbox</span>“{params.get('prompt')}”
            </p>
          )}
          <button type="button" className="au-google" onClick={() => setError('Google sign-in connects once the backend is live.')}>
            <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
              <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
            </svg>
            Continue with Google
          </button>
          <div className="au-or label">or with email</div>
          {isSignup && (
            <label className="fld">
              <span className="label">Name</span>
              <input name="name" autoComplete="name" placeholder="Ada Okafor" />
            </label>
          )}
          <label className="fld">
            <span className="label">Email</span>
            <input name="email" type="email" autoComplete="email" placeholder="you@company.com" />
          </label>
          <label className="fld">
            <span className="label">Password</span>
            <input name="password" type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} placeholder="8+ characters" />
          </label>
          {error && (
            <p className="au-err" role="alert">
              {error}
            </p>
          )}
          <Btn type="submit" className="au-submit" disabled={busy}>
            {busy ? 'Connecting…' : isSignup ? 'Create account' : 'Log in'}
          </Btn>
          <p className="au-switch">
            {isSignup ? 'Have an account?' : 'New here?'}{' '}
            <Link to={isSignup ? '/login' : '/signup'}>{isSignup ? 'Log in' : 'Create one — free'}</Link>
          </p>
          <p className="label au-demo">Demo: any email + 8-character password</p>
        </form>
      </main>
      <aside className="au-art" aria-hidden>
        <DitherField cell={4} density={1.3} fadeLeft={false} />
        <div className="au-art-top label">
          <span>
            <span className="led blink" /> Routing now
          </span>
          <span>Board 02</span>
        </div>
        <div className="au-ticker">
          <SplitFlap value={TICKER[tick % TICKER.length]} length={17} className="flap-auth" stagger={1} />
        </div>
        <blockquote className="au-quote display">
          “One place
          <br />
          <em>for everything.”</em>
          <span className="label">— Beta user</span>
        </blockquote>
      </aside>
    </div>
  )
}
