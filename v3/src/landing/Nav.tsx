import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ScrollTrigger, scrollToTarget, gsap } from '../lib/motion'
import { Arrow, Icon, Logo, Magnetic } from '../components/ui'

const LINKS = [
  { href: '#product', label: 'Product' },
  { href: '#routing', label: 'Routing' },
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
]

export function Nav() {
  const ref = useRef<HTMLElement>(null)
  const pill = useRef<HTMLSpanElement>(null)
  const links = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (s) => ref.current?.classList.toggle('is-scrolled', s.scroll() > 24),
    })
    return () => st.kill()
  }, [])

  // A soft highlight glides behind whichever link is hovered
  const hover = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const p = links.current!.getBoundingClientRect()
    gsap.to(pill.current, { x: r.left - p.left, width: r.width, opacity: 1, duration: 0.45, ease: 'kwoat' })
  }
  const leave = () => gsap.to(pill.current, { opacity: 0, duration: 0.3 })

  const go = (href: string) => {
    setOpen(false)
    scrollToTarget(href)
  }

  return (
    <header ref={ref} className={`nav ${open ? 'is-open' : ''}`}>
      <div className="nav-bar">
        <Link to="/" className="nav-logo" aria-label="Kwoat home">
          <Logo />
        </Link>
        <nav ref={links} className="nav-links" aria-label="Main" onMouseLeave={leave}>
          <span ref={pill} className="nav-pill" aria-hidden />
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onMouseEnter={hover}
              onClick={(e) => {
                e.preventDefault()
                go(l.href)
              }}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="nav-cta">
          <Link to="/login" className="nav-login">
            Log in
          </Link>
          <Magnetic to="/signup" className="btn btn-white btn-sm">
            Start free <Arrow />
          </Magnetic>
          <button className="nav-burger" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
            <Icon name={open ? 'x' : 'menu'} />
          </button>
        </div>
      </div>
      <div className="nav-sheet">
        {LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            onClick={(e) => {
              e.preventDefault()
              go(l.href)
            }}
          >
            {l.label}
          </a>
        ))}
        <Link to="/login" onClick={() => setOpen(false)}>
          Log in
        </Link>
      </div>
    </header>
  )
}
