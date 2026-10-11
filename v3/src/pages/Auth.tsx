import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { gsap } from '../lib/motion'
import { Arrow, Logo, Mark } from '../components/ui'
import { Rays } from '../components/Rays'
import { useAuth } from '../lib/store'
import { MODELS } from '../api'

export default function Auth({ mode }: { mode: 'login' | 'signup' }) {
  const isSignup = mode === 'signup'
  const { login, signup } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.au-form > *', { y: 14, opacity: 0, filter: 'blur(6px)', duration: 1, ease: 'kwoat', stagger: 0.05 })
      gsap.from('.au-side', { opacity: 0, duration: 1.6, ease: 'power2.out' })
      gsap.from('.au-models span', { opacity: 0, y: 8, duration: 0.8, ease: 'kwoat', stagger: 0.04, delay: 0.4 })
    }, root)
    return () => ctx.revert()
  }, [mode])

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
      <main className="au-main">
        <Link to="/" className="au-logo" aria-label="Kwoat home">
          <Logo />
        </Link>
        <form className="au-form" onSubmit={submit} noValidate>
          <h1>{isSignup ? 'Create your account' : 'Welcome back'}</h1>
          <p className="au-sub">{isSignup ? '50 free credits every day. No card needed.' : 'Log in to pick up where you left off.'}</p>
          {params.get('prompt') && (
            <div className="au-prompt">
              <Mark size={12} /> Your prompt is ready: <b>“{params.get('prompt')}”</b>
            </div>
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
          <div className="au-or">or</div>
          {isSignup && (
            <label className="au-field">
              <span>Name</span>
              <input name="name" autoComplete="name" placeholder="Ada Okafor" />
            </label>
          )}
          <label className="au-field">
            <span>Email</span>
            <input name="email" type="email" autoComplete="email" placeholder="you@company.com" />
          </label>
          <label className="au-field">
            <span>Password</span>
            <input name="password" type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} placeholder="At least 8 characters" />
          </label>
          {error && (
            <p className="au-err" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-primary btn-lg au-submit" disabled={busy}>
            {busy ? <span className="spinner" /> : null}
            {isSignup ? 'Create account' : 'Log in'}
            {!busy && <Arrow />}
          </button>
          <p className="au-switch">
            {isSignup ? 'Already have an account?' : 'New to Kwoat?'} <Link to={isSignup ? '/login' : '/signup'}>{isSignup ? 'Log in' : 'Create one free'}</Link>
          </p>
          <p className="au-demo">Demo: any email and an 8-character password.</p>
        </form>
        <p className="au-legal">
          By continuing you agree to the <a href="/">Terms</a> and <a href="/">Privacy Policy</a>.
        </p>
      </main>
      <aside className="au-side" aria-hidden>
        <Rays focal={[0.5, 0.46]} spread={0.9} />
        <div className="au-side-inner">
          <Mark size={40} />
          <p>“Exactly what I was looking for. One place for everything.”</p>
          <span>Beta user, founder</span>
        </div>
        <div className="au-models">
          {MODELS.slice(0, 9).map((m) => (
            <span key={m.id}>{m.name}</span>
          ))}
        </div>
      </aside>
      <style>{AUTH_CSS}</style>
    </div>
  )
}

const AUTH_CSS = `
.auth{min-height:100svh;display:grid;grid-template-columns:minmax(360px,.9fr) 1.1fr}
.au-main{display:flex;flex-direction:column;padding:28px var(--gutter)}
.au-form{margin:auto;width:100%;max-width:380px;display:grid;gap:14px;padding:40px 0}
.au-form h1{font-size:30px;font-weight:600;letter-spacing:-.04em}
.au-sub{color:var(--fg-3);font-size:15px;margin-top:-6px;margin-bottom:8px}
.au-prompt{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap;padding:10px 12px;border-radius:12px;font-size:13.5px;color:var(--fg-2);background:var(--violet-soft);box-shadow:inset 0 0 0 1px rgba(139,92,246,.3)}
.au-prompt svg{color:var(--violet-3);align-self:center}
.au-prompt b{color:var(--fg);font-weight:500}
.au-google{height:46px;display:flex;align-items:center;justify-content:center;gap:10px;border-radius:12px;font-size:14.5px;font-weight:500;background:rgba(255,255,255,.04);box-shadow:inset 0 0 0 1px var(--line-2);transition:background .2s,box-shadow .2s}
.au-google:hover{background:rgba(255,255,255,.07);box-shadow:inset 0 0 0 1px var(--line-3)}
.au-or{display:flex;align-items:center;gap:12px;font-size:12.5px;color:var(--fg-4)}
.au-or::before,.au-or::after{content:'';flex:1;height:1px;background:var(--line)}
.au-field{display:grid;gap:7px}
.au-field span{font-size:13px;color:var(--fg-2);font-weight:500}
.au-field input{height:46px;padding:0 14px;border-radius:12px;border:0;outline:0;background:rgba(255,255,255,.03);box-shadow:inset 0 0 0 1px var(--line-2);font-size:15px;transition:box-shadow .2s,background .2s}
.au-field input::placeholder{color:var(--fg-4)}
.au-field input:focus{background:rgba(255,255,255,.05);box-shadow:inset 0 0 0 1px rgba(167,139,250,.7),0 0 0 4px rgba(124,58,237,.18)}
.au-err{font-size:13.5px;color:#f87171}
.au-submit{width:100%;margin-top:6px;border-radius:12px}
.au-switch{text-align:center;font-size:14px;color:var(--fg-3)}
.au-switch a{color:var(--fg);font-weight:500}
.au-demo{text-align:center;font-size:12px;color:var(--fg-4);font-family:var(--mono)}
.au-legal{text-align:center;font-size:12.5px;color:var(--fg-4)}
.au-legal a{color:var(--fg-3);text-decoration:underline;text-underline-offset:3px}
.au-side{position:relative;overflow:hidden;border-left:1px solid var(--line);display:grid;place-items:center}
.au-side-inner{position:relative;display:grid;justify-items:center;gap:16px;text-align:center;max-width:440px;padding:0 24px;margin-top:22vh}
.au-side-inner svg{color:#fff;filter:drop-shadow(0 0 18px rgba(167,139,250,.9))}
.au-side-inner p{font-size:24px;line-height:1.35;letter-spacing:-.025em;font-weight:500}
.au-side-inner span{font-size:13.5px;color:var(--fg-3)}
.au-models{position:absolute;left:0;right:0;bottom:28px;display:flex;flex-wrap:wrap;justify-content:center;gap:8px;padding:0 24px}
.au-models span{font-size:12px;padding:5px 10px;border-radius:999px;color:var(--fg-3);background:rgba(10,9,16,.6);backdrop-filter:blur(8px);box-shadow:inset 0 0 0 1px var(--line)}
@media (max-width:900px){.auth{grid-template-columns:1fr}.au-side{display:none}}
`
