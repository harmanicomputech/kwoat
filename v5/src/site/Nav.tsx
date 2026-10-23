import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap, scrollToTarget } from '../lib/motion'
import { Icon, Logo, Magnetic, type IconName } from '../components/ui'
import { ThemeToggle } from '../components/ThemeToggle'
import { useAuth } from '../lib/store'

const PRODUCT: { icon: IconName; title: string; text: string; href: string; c: string }[] = [
  { icon: 'sparkle', title: 'Auto mode', text: 'The best model for every prompt', href: '#auto', c: '#8b5cf6' },
  { icon: 'compare', title: 'Compare', text: 'Four models, side by side', href: '#features', c: '#10b981' },
  { icon: 'image', title: 'Images & video', text: 'FLUX, Nano Banana, Kling', href: '#features', c: '#ec4899' },
  { icon: 'mic', title: 'Voice live', text: 'Talk to any model, hands-free', href: '#features', c: '#f59e0b' },
  { icon: 'rocket', title: 'Missions', text: 'Agents that deliver real files', href: '#features', c: '#3b82f6' },
  { icon: 'wallet', title: 'One wallet', text: 'Pay only for what you use', href: '#pricing', c: '#14b8a6' },
]

const LINKS = [
  { label: 'How it works', href: '#how' },
  { label: 'Models', href: '#models' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

export function Nav() {
  const { user } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mega, setMega] = useState(false)
  const [open, setOpen] = useState(false)
  const bar = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const sheet = useRef<HTMLDivElement>(null)
  const leave = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24)
      const max = document.documentElement.scrollHeight - innerHeight
      bar.current?.style.setProperty('--p', String(max > 0 ? scrollY / max : 0))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (mega && panel.current) {
      gsap.fromTo(panel.current, { opacity: 0, y: -10, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'kwoat' })
      gsap.fromTo(panel.current.querySelectorAll('.mm-item'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: 0.035, duration: 0.45, ease: 'kwoat' })
    }
  }, [mega])

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
    if (open && sheet.current) gsap.fromTo(sheet.current.querySelectorAll('.ms5-link'), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.05, duration: 0.7, ease: 'kwoat', delay: 0.1 })
  }, [open])

  const go = (href: string) => {
    setMega(false)
    setOpen(false)
    scrollToTarget(href)
  }

  return (
    <header ref={bar} className={`n5 ${scrolled ? 'scrolled' : ''} ${open ? 'open' : ''}`}>
      <div className="n5-bar">
        <Link to="/" className="n5-logo" aria-label="Kwoat home">
          <Logo size={24} />
        </Link>
        <nav className="n5-links" aria-label="Main">
          <div className="n5-mega-wrap" onMouseEnter={() => (clearTimeout(leave.current), setMega(true))} onMouseLeave={() => (leave.current = setTimeout(() => setMega(false), 160))}>
            <button className={`n5-link ${mega ? 'on' : ''}`} aria-expanded={mega} onClick={() => setMega((m) => !m)}>
              Product <Icon name="chevronDown" size={14} />
            </button>
            {mega && (
              <div ref={panel} className="n5-mega">
                <div className="mm-grid">
                  {PRODUCT.map((p) => (
                    <a key={p.title} href={p.href} className="mm-item" style={{ ['--c' as string]: p.c }} onClick={(e) => (e.preventDefault(), go(p.href))}>
                      <span className="mm-ico">
                        <Icon name={p.icon} size={18} />
                      </span>
                      <span>
                        <b>{p.title}</b>
                        <small>{p.text}</small>
                      </span>
                    </a>
                  ))}
                </div>
                <Link to="/signup" className="mm-feature">
                  <span className="mm-feature-art" aria-hidden>
                    <i />
                    <i />
                    <i />
                  </span>
                  <small>New</small>
                  <b>Missions: your AI that does the work</b>
                  <span className="mm-more">
                    Try it free <Icon name="send" size={13} />
                  </span>
                </Link>
              </div>
            )}
          </div>
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="n5-link" onClick={(e) => (e.preventDefault(), go(l.href))}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="n5-actions">
          <ThemeToggle />
          {user ? (
            <Magnetic to="/app" className="btn btn-primary btn-sm">
              Open app
            </Magnetic>
          ) : (
            <>
              <Link to="/login" className="n5-login">
                Log in
              </Link>
              <Magnetic to="/signup" className="btn btn-primary btn-sm n5-cta">
                Start free
              </Magnetic>
            </>
          )}
          <button className="n5-burger" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
            <i />
            <i />
          </button>
        </div>
        <span className="n5-progress" aria-hidden />
      </div>

      <div ref={sheet} className="n5-sheet" aria-hidden={!open}>
        {[{ label: 'Product', href: '#features' }, { label: 'Auto mode', href: '#auto' }, ...LINKS, { label: 'Mobile app', href: '#app' }].map((l) => (
          <div key={l.label} className="ms5-mask">
            <a href={l.href} className="ms5-link" onClick={(e) => (e.preventDefault(), go(l.href))}>
              {l.label}
            </a>
          </div>
        ))}
        <div className="ms5-actions">
          <Link to="/login" className="btn btn-ghost">
            Log in
          </Link>
          <Link to="/signup" className="btn btn-primary">
            Start free
          </Link>
        </div>
      </div>
    </header>
  )
}
