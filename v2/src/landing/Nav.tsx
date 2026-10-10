import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap, ScrollTrigger, scrollToTarget } from '../lib/motion'
import { Btn, Icon, Wordmark } from '../components/ui'
import { useTheme } from '../lib/store'

const LINKS = [
  { href: '#ensemble', label: 'Models', n: '01' },
  { href: '#board', label: 'Routing', n: '02' },
  { href: '#stack', label: 'Features', n: '03' },
  { href: '#pricing', label: 'Pricing', n: '04' },
]

function Clock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return <>{now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</>
}

export function Nav() {
  const ref = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)
  const { theme, toggle } = useTheme()

  useEffect(() => {
    const el = ref.current!
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (s) => {
        el.classList.toggle('is-solid', s.scroll() > 30)
        gsap.to(el, { yPercent: s.direction === 1 && s.scroll() > 500 ? -100 : 0, duration: 0.6, ease: 'kwoat', overwrite: true })
      },
    })
    return () => st.kill()
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open)
    if (!open) return
    gsap.fromTo('.menu-link', { yPercent: 110 }, { yPercent: 0, duration: 1, ease: 'kwoat', stagger: 0.06, delay: 0.25 })
  }, [open])

  const go = (href: string) => {
    setOpen(false)
    scrollToTarget(href)
  }

  return (
    <>
      <header ref={ref} className="nav">
        <div className="nav-row container">
          <Link to="/" className="nav-brand" aria-label="Kwoat home">
            <Wordmark />
          </Link>
          <div className="nav-status label">
            <span className="led ok" /> 13 models online · <Clock />
          </div>
          <nav className="nav-links" aria-label="Main">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => {
                  e.preventDefault()
                  go(l.href)
                }}
              >
                <sup>{l.n}</sup>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="nav-actions">
            <button className="nav-icon" onClick={toggle} aria-label="Toggle theme">
              <Icon name={theme === 'light' ? 'moon' : 'sun'} />
            </button>
            <Link to="/login" className="nav-login">
              Log in
            </Link>
            <Btn to="/signup" size="sm">
              Start free
            </Btn>
            <button className="nav-burger" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
              <i />
              <i />
            </button>
          </div>
        </div>
      </header>

      <div className={`menu ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <div className="menu-inner container">
          {LINKS.map((l) => (
            <div className="menu-row" key={l.href}>
              <a
                className="menu-link display"
                href={l.href}
                onClick={(e) => {
                  e.preventDefault()
                  go(l.href)
                }}
              >
                <span className="label">{l.n}</span>
                {l.label}
              </a>
            </div>
          ))}
          <div className="menu-row">
            <Link className="menu-link display" to="/login" onClick={() => setOpen(false)}>
              <span className="label">05</span>
              <em>Log in</em>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
