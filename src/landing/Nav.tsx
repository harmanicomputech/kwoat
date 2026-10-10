import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap, ScrollTrigger, scrollToTarget } from '../lib/motion'
import { Arrow, Icon, Logo, Magnetic } from '../components/ui'
import { useTheme } from '../lib/store'

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#routing', label: 'How it works' },
  { href: '#models', label: 'Models' },
  { href: '#pricing', label: 'Pricing' },
]

export function Nav() {
  const ref = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)
  const { theme, toggle } = useTheme()

  useEffect(() => {
    const el = ref.current!
    const st = ScrollTrigger.create({
      start: 'top -80',
      end: 'max',
      onUpdate: (self) => {
        el.classList.toggle('is-scrolled', self.scroll() > 40)
        if (open) return
        gsap.to(el, { yPercent: self.direction === 1 && self.scroll() > 400 ? -130 : 0, duration: 0.5, ease: 'kwoat' })
      },
    })
    return () => st.kill()
  }, [open])

  useEffect(() => {
    if (!open) return
    gsap.fromTo('.mnav a', { yPercent: 120, rotate: 6 }, { yPercent: 0, rotate: 0, stagger: 0.06, duration: 0.9, ease: 'kwoat', delay: 0.15 })
  }, [open])

  const go = (href: string) => {
    setOpen(false)
    scrollToTarget(href)
  }

  return (
    <>
      <header ref={ref} className="nav">
        <div className="nav-inner">
          <Link to="/" aria-label="Kwoat home" data-cursor="hover">
            <Logo />
          </Link>
          <nav className="nav-links" aria-label="Main">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => {
                  e.preventDefault()
                  go(l.href)
                }}
                className="nav-link"
              >
                <span className="nl-mask">
                  <span data-text={l.label}>{l.label}</span>
                </span>
              </a>
            ))}
          </nav>
          <div className="nav-actions">
            <button className="icon-btn" onClick={toggle} aria-label="Toggle theme" data-cursor="hover">
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
            </button>
            <Link to="/login" className="nav-login">
              Log in
            </Link>
            <Magnetic to="/signup" className="btn btn-primary btn-sm">
              Start free <Arrow />
            </Magnetic>
            <button className="icon-btn nav-burger" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
              <Icon name={open ? 'x' : 'menu'} />
            </button>
          </div>
        </div>
      </header>
      <div className={`mnav ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        {LINKS.map((l, i) => (
          <div className="mnav-row" key={l.href}>
            <a
              href={l.href}
              onClick={(e) => {
                e.preventDefault()
                go(l.href)
              }}
            >
              <small>0{i + 1}</small>
              {l.label}
            </a>
          </div>
        ))}
        <div className="mnav-row">
          <Link to="/login" onClick={() => setOpen(false)}>
            <small>05</small>Log in
          </Link>
        </div>
      </div>
    </>
  )
}
