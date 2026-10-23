import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap, isTouch, scrollToTarget } from '../lib/motion'
import { Icon, Logo, Magnetic } from '../components/ui'

const COLS: { h: string; links: [string, string][] }[] = [
  { h: 'Product', links: [['Auto mode', '#auto'], ['Features', '#features'], ['Models', '#models'], ['Pricing', '#pricing'], ['Mobile apps', '#app']] },
  { h: 'Company', links: [['About', '#'], ['Blog', '#'], ['Careers', '#'], ['Contact', 'mailto:support@kwoat.ai']] },
  { h: 'Legal', links: [['Terms', '#'], ['Privacy', '#'], ['Refund policy', '#'], ['Cookies', '#']] },
]

export function Footer() {
  const cta = useRef<HTMLDivElement>(null)
  const word = useRef<HTMLDivElement>(null)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  // Pointer-follow glow on the CTA card and a light that reveals the wordmark
  const track = (e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget
    if (isTouch()) return
    const r = el.getBoundingClientRect()
    gsap.to(el, { '--x': `${e.clientX - r.left}px`, '--y': `${e.clientY - r.top}px`, duration: 0.5, ease: 'power3' })
  }

  return (
    <footer className="f5">
      <div className="container">
        <div ref={cta} className="f5-cta" onPointerMove={track} data-reveal>
          <span className="f5-cta-grid" aria-hidden />
          <span className="f5-cta-glow" aria-hidden />
          <h2 data-split>Every AI model. One platform.</h2>
          <p>Start with 50 free credits today. No card, no commitment.</p>
          <div className="f5-cta-btns">
            <Magnetic to="/signup" className="btn btn-primary btn-lg">
              Start free <Icon name="send" size={16} />
            </Magnetic>
            <Link to="/login" className="btn btn-ghost btn-lg">
              Log in
            </Link>
          </div>
        </div>

        <div className="f5-cols">
          <div className="f5-brand">
            <Logo size={24} />
            <p>Stop choosing. Start doing.</p>
            <form
              className={`f5-news ${sent ? 'sent' : ''}`}
              onSubmit={(e) => {
                e.preventDefault()
                if (/\S+@\S+\.\S+/.test(email)) setSent(true)
              }}
            >
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email for product news" aria-label="Email" disabled={sent} />
              <button type="submit" aria-label="Subscribe">
                {sent ? <Icon name="check" size={16} /> : <Icon name="send" size={16} />}
              </button>
              <span className="f5-news-ok">Thanks — you’re on the list.</span>
            </form>
          </div>
          {COLS.map((c) => (
            <div key={c.h} className="f5-col">
              <h4>{c.h}</h4>
              {c.links.map(([l, href]) => (
                <a
                  key={l}
                  href={href}
                  onClick={(e) => {
                    if (href.startsWith('#') && href.length > 1) {
                      e.preventDefault()
                      scrollToTarget(href)
                    }
                  }}
                >
                  {l}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className="f5-bottom">
          <span>© {new Date().getFullYear()} Kwoat. All rights reserved.</span>
          <div className="f5-social">
            {[
              ['X', 'M4 4l16 16M20 4 4 20'],
              ['LinkedIn', 'M6 9v10M6 5v.01M10 19v-6a3 3 0 0 1 6 0v6M10 9v10'],
              ['Instagram', 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm5.5-1.5h.01'],
              ['YouTube', 'M3 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8Zm7 1v6l5-3-5-3Z'],
            ].map(([n, d]) => (
              <a key={n} href="#" aria-label={n}>
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d={d} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
      <div ref={word} className="f5-word" onPointerMove={track} aria-hidden>
        <span>KWOAT</span>
        <span className="lit">KWOAT</span>
      </div>
    </footer>
  )
}
