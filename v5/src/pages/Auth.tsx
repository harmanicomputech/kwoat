import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { gsap } from '../lib/motion'
import { Arrow, Logo, Mark } from '../components/ui'
import { ThemeToggle } from '../components/ThemeToggle'
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
        <div className="au-top">
          <Link to="/" className="au-logo" aria-label="Kwoat home">
            <Logo />
          </Link>
          <ThemeToggle />
        </div>
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
        <div className="au-mesh" />
        <div className="au-rays">
          {Array.from({ length: 5 }).map((_, i) => (
            <i key={i} style={{ ['--k' as string]: i - 2 }} />
          ))}
        </div>
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
.auth{min-height:100svh;display:grid;grid-template-columns:minmax(360px,.9fr) 1.1fr;background:var(--bg)}
.au-main{display:flex;flex-direction:column;padding:24px var(--gutter)}
.au-top{display:flex;justify-content:space-between;align-items:center}
.au-form{margin:auto;width:100%;max-width:390px;display:grid;gap:14px;padding:40px 0}
.au-form h1{font-size:34px;font-weight:650;letter-spacing:-.045em}
.au-sub{color:var(--text-3);font-size:15px;margin-top:-6px;margin-bottom:8px}
.au-prompt{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap;padding:10px 12px;border-radius:14px;font-size:13.5px;color:var(--text-2);background:var(--violet-soft);box-shadow:inset 0 0 0 1px color-mix(in oklab,var(--violet) 25%,transparent)}
.au-prompt svg{color:var(--violet);align-self:center}
.au-prompt b{color:var(--text);font-weight:550}
.au-google{height:48px;display:flex;align-items:center;justify-content:center;gap:10px;border-radius:14px;font-size:14.5px;font-weight:550;background:var(--surface);box-shadow:inset 0 0 0 1px var(--line-strong),var(--shadow);transition:transform .3s var(--ease),box-shadow .3s}
.au-google:hover{transform:translateY(-2px);box-shadow:inset 0 0 0 1px var(--violet),var(--shadow)}
.au-or{display:flex;align-items:center;gap:12px;font-size:12.5px;color:var(--text-3)}
.au-or::before,.au-or::after{content:'';flex:1;height:1px;background:var(--line-strong)}
.au-field{display:grid;gap:7px}
.au-field span{font-size:13px;color:var(--text-2);font-weight:550}
.au-field input{height:50px;padding:0 16px;border-radius:14px;border:0;outline:0;background:var(--surface);box-shadow:inset 0 0 0 1px var(--line-strong);font-size:15px;transition:box-shadow .25s}
.au-field input::placeholder{color:var(--text-3)}
.au-field input:focus{box-shadow:inset 0 0 0 1.5px var(--violet),0 0 0 5px var(--violet-soft)}
.au-err{font-size:13.5px;color:var(--danger)}
.au-submit{width:100%;margin-top:6px;border-radius:14px}
.au-switch{text-align:center;font-size:14px;color:var(--text-3)}
.au-switch a{color:var(--violet-ink);font-weight:600}
.au-demo{text-align:center;font-size:12px;color:var(--text-3);font-family:var(--mono)}
.au-legal{text-align:center;font-size:12.5px;color:var(--text-3)}
.au-legal a{text-decoration:underline;text-underline-offset:3px}
.au-side{position:relative;overflow:hidden;margin:12px;border-radius:32px;display:grid;place-items:center;background:var(--surface-2)}
.au-mesh{position:absolute;inset:-30%;background:conic-gradient(from 0deg at 50% 50%,#c4b5fd,#f9a8d4,#fed7aa,#bae6fd,#a78bfa,#c4b5fd);filter:blur(70px);opacity:.75;animation:rot 22s linear infinite}
:root[data-theme='dark'] .au-mesh{opacity:.35}
.au-rays{position:absolute;left:50%;top:-10%;width:0;height:62%}
.au-rays i{position:absolute;left:-3px;bottom:0;width:6px;height:100%;border-radius:6px;transform-origin:50% 100%;transform:rotate(calc(var(--k)*13deg));background:linear-gradient(to bottom,transparent,rgba(255,255,255,.85));box-shadow:0 0 30px rgba(255,255,255,.7);animation:rayIn 1.6s var(--ease) both;animation-delay:calc((var(--k) + 2)*.08s)}
@keyframes rayIn{from{transform:rotate(calc(var(--k)*30deg)) scaleY(0)}}
.au-side-inner{position:relative;display:grid;justify-items:center;gap:16px;text-align:center;max-width:460px;padding:28px;margin-top:18vh;border-radius:28px;background:var(--glass);backdrop-filter:blur(20px);box-shadow:inset 0 0 0 1px var(--glass-line),var(--shadow-lg)}
.au-side-inner svg{color:var(--violet)}
.au-side-inner p{font-size:24px;line-height:1.3;letter-spacing:-.03em;font-weight:600}
.au-side-inner span{font-size:13.5px;color:var(--text-2)}
.au-models{position:absolute;left:0;right:0;bottom:24px;display:flex;flex-wrap:wrap;justify-content:center;gap:8px;padding:0 24px}
.au-models span{font-size:12px;padding:6px 11px;border-radius:999px;color:var(--text-2);background:var(--glass);backdrop-filter:blur(10px);box-shadow:inset 0 0 0 1px var(--glass-line)}
@media (max-width:900px){.auth{grid-template-columns:1fr}.au-side{display:none}}
`
