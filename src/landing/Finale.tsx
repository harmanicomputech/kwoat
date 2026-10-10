import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap, SplitText } from '../lib/motion'
import { Arrow, Logo, Magnetic } from '../components/ui'

export function CTA() {
  const root = useRef<HTMLElement>(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      const split = SplitText.create('.cta-title', { type: 'chars,lines', linesClass: 'cta-line', charsClass: 'ch' })
      gsap.from(split.chars, {
        yPercent: 110,
        stagger: 0.02,
        duration: 1.1,
        ease: 'kwoat',
        scrollTrigger: { trigger: root.current, start: 'top 65%' },
      })
      gsap.fromTo(
        '.cta-bg',
        { scale: 0.6, borderRadius: '200px' },
        { scale: 1, borderRadius: '40px', ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'top 20%', scrub: true } },
      )
      gsap.to('.cta-ring', { rotate: 360, duration: 40, repeat: -1, ease: 'none' })
    }, root)
    return () => ctx.revert()
  }, [])
  return (
    <section ref={root} className="cta">
      <div className="cta-bg">
        <div className="cta-ring" aria-hidden />
        <div className="cta-content">
          <h2 className="cta-title">
            Every AI model.
            <br />
            One wallet.
          </h2>
          <p>Stop managing five separate subscriptions. Start on Kwoat free — no card needed.</p>
          <div className="cta-actions">
            <Magnetic to="/signup" className="btn btn-primary btn-lg">
              Start for free <Arrow />
            </Magnetic>
            <Magnetic href="#top" className="btn btn-ghost btn-lg">
              Read the docs
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  const root = useRef<HTMLElement>(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.ft-word span',
        { yPercent: 100 },
        {
          yPercent: 0,
          stagger: 0.06,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom bottom', scrub: true },
        },
      )
    }, root)
    return () => ctx.revert()
  }, [])
  return (
    <footer ref={root} className="footer">
      <div className="container footer-top">
        <div>
          <Logo />
          <p className="footer-tag">AI models, one platform.</p>
        </div>
        <nav className="footer-cols" aria-label="Footer">
          <div>
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#models">Models</a>
            <Link to="/app">Open app</Link>
          </div>
          <div>
            <h4>Company</h4>
            <a href="#top">Docs</a>
            <a href="#top">Changelog</a>
            <a href="#top">Contact</a>
          </div>
          <div>
            <h4>Legal</h4>
            <a href="#top">Privacy</a>
            <a href="#top">Terms</a>
            <a href="#top">Cookies</a>
          </div>
        </nav>
      </div>
      <div className="ft-word" aria-hidden>
        {'KWOAT'.split('').map((c, i) => (
          <span key={i}>{c}</span>
        ))}
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Kwoat Technologies, LLC</span>
        <span>Made for people who’d rather be doing.</span>
      </div>
    </footer>
  )
}
