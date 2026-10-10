import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap, ScrollTrigger } from '../lib/motion'
import { SplitFlap } from '../components/SplitFlap'
import { DitherField } from '../components/DitherField'
import { Btn, Icon, Section, Wordmark } from '../components/ui'
import { PLANS } from '../api'
import { scrollToTarget } from '../lib/motion'

/* ---------------- Statement: scroll-driven type ---------------- */

export function Statement() {
  const root = useRef<HTMLElement>(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.sm-a', { xPercent: -30, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
      gsap.to('.sm-b', { xPercent: 22, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
      const skew = gsap.quickTo('.sm-line', 'skewX', { duration: 0.6, ease: 'power3' })
      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (s) => skew(gsap.utils.clamp(-12, 12, s.getVelocity() / -300)),
      })
      gsap.fromTo('.sm-dial', { rotate: -120 }, { rotate: 240, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
    }, root)
    return () => ctx.revert()
  }, [])
  return (
    <section ref={root} className="statement" aria-label="Kwoat in one line">
      <div className="sm-line sm-a display">
        Five subscriptions <em>→</em> one wallet <em>→</em> five tabs <em>→</em> one box <em>→</em> Five subscriptions <em>→</em> one wallet
      </div>
      <div className="sm-center">
        <svg className="sm-dial" viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1" />
          {Array.from({ length: 60 }).map((_, i) => (
            <line key={i} x1="50" y1="6" x2="50" y2={i % 5 ? 9 : 13} stroke="currentColor" strokeWidth={i % 5 ? 0.6 : 1.2} transform={`rotate(${i * 6} 50 50)`} />
          ))}
          <line x1="50" y1="50" x2="50" y2="14" stroke="var(--signal)" strokeWidth="2" strokeLinecap="round" />
          <circle cx="50" cy="50" r="3" fill="var(--signal)" />
        </svg>
        <p className="label">
          <b>Stop choosing.</b> Start doing.
        </p>
      </div>
      <div className="sm-line sm-b display sm-outline">
        <em>every</em> model · one prompt · <em>every</em> model · one prompt · <em>every</em> model
      </div>
    </section>
  )
}

/* ---------------- Pricing: ticket stubs ---------------- */

function FlapPrice({ value }: { value: number }) {
  const text = value === 0 ? 'FREE' : value % 1 === 0 ? String(value) : value.toFixed(2)
  return <SplitFlap value={text} length={text.length} className="flap-price" speed={24} stagger={2} />
}

export function Pricing() {
  const [yearly, setYearly] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.tk', {
        y: 140,
        rotate: (i) => [-4, 3, -2, 5][i],
        opacity: 0,
        duration: 1.5,
        ease: 'kwoat',
        stagger: 0.1,
        scrollTrigger: { trigger: '.tk-row', start: 'top 85%' },
      })
    }, root)
    return () => ctx.revert()
  }, [])
  return (
    <Section id="pricing" index="04" title="Pricing" className="pricing">
      <div ref={root} className="container">
        <div className="pc-head">
          <h2 className="display">
            Start free.
            <br />
            <em>Scale</em> when ready.
          </h2>
          <div className="pc-side">
            <p>See the cost of every response. Top up a wallet or pick a plan. Cancel any time.</p>
            <button className="switch" role="switch" aria-checked={yearly} onClick={() => setYearly((y) => !y)} data-cursor="Flip">
              <span className={`label ${!yearly ? 'is-on' : ''}`}>Monthly</span>
              <span className="switch-track">
                <span className="switch-thumb" />
              </span>
              <span className={`label ${yearly ? 'is-on' : ''}`}>
                Yearly <span className="signal">−1 mo</span>
              </span>
            </button>
          </div>
        </div>

        <div className="tk-row">
          {PLANS.map((p, i) => {
            const featured = p.id === 'pro'
            const price = yearly ? p.yearly : p.monthly
            return (
              <article key={p.id} className={`tk ${featured ? 'is-featured' : ''}`}>
                <div className="tk-main">
                  <div className="tk-top">
                    <span className="label">
                      <b>No. {String(i + 1).padStart(3, '0')}</b>
                    </span>
                    {p.badge && <span className="tk-badge label">{p.badge}</span>}
                  </div>
                  <h3 className="display">{p.name}</h3>
                  <p className="tk-tag">{p.tagline}</p>
                  <div className="tk-price">
                    {price > 0 && <span className="tk-cur">$</span>}
                    <FlapPrice value={price} />
                    {price > 0 && <span className="label">/{yearly ? 'yr' : 'mo'}</span>}
                  </div>
                  <ul>
                    {p.features.map((f) => (
                      <li key={f}>
                        <Icon name="check" size={14} /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="tk-perf" aria-hidden />
                <div className="tk-stub">
                  <Btn to={`/signup?plan=${p.id}`} variant={featured ? 'signal' : 'ink'} size="sm" className="tk-cta">
                    {p.cta}
                  </Btn>
                  <span className="tk-barcode" aria-hidden />
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </Section>
  )
}

/* ---------------- Voices ---------------- */

const QUOTES = [
  { q: 'Really fast — way quicker than switching between tabs.', who: 'Beta user', role: 'Product designer, Lagos' },
  { q: 'Exactly what I was looking for. One place for everything.', who: 'Beta user', role: 'Founder, London' },
  { q: 'The UI/UX is so beautiful. Feels premium.', who: 'Beta user', role: 'Engineer, Nairobi' },
]

export function Voices() {
  const [i, setI] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % QUOTES.length), 5200)
    return () => clearInterval(id)
  }, [])
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.vc-q .w', { yPercent: 100, opacity: 0, filter: 'blur(8px)' }, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1.1, ease: 'kwoat', stagger: 0.035 })
    }, root)
    return () => ctx.revert()
  }, [i])
  const q = QUOTES[i]
  return (
    <Section index="05" title="Early voices" className="voices">
      <div ref={root} className="container vc">
        <span className="vc-mark display">“</span>
        <blockquote className="vc-q display" key={i}>
          {q.q.split(' ').map((w, k) => (
            <span className="w-mask" key={k}>
              <span className="w">{w}&nbsp;</span>
            </span>
          ))}
        </blockquote>
        <div className="vc-foot">
          <span className="label">
            <b>{q.who}</b> — {q.role}
          </span>
          <div className="vc-dots">
            {QUOTES.map((_, k) => (
              <button key={k} className={k === i ? 'is-on' : ''} onClick={() => setI(k)} aria-label={`Quote ${k + 1}`}>
                <i />
              </button>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ---------------- Footer ---------------- */

const CITIES = [
  ['Lagos', 'Africa/Lagos'],
  ['London', 'Europe/London'],
  ['New York', 'America/New_York'],
  ['San Francisco', 'America/Los_Angeles'],
]

export function Footer() {
  const [now, setNow] = useState(() => new Date())
  const root = useRef<HTMLElement>(null)
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.ft-cta .display', {
        yPercent: 40,
        opacity: 0,
        duration: 1.6,
        ease: 'kwoat',
        scrollTrigger: { trigger: '.ft-cta', start: 'top 80%' },
      })
      gsap.fromTo('.ft-word', { yPercent: 40 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.ft-word', start: 'top bottom', end: 'bottom bottom', scrub: true } })
    }, root)
    return () => ctx.revert()
  }, [])
  return (
    <footer ref={root} className="footer">
      <div className="ft-cta container">
        <h2 className="display">
          Every AI model.
          <br />
          <em>One wallet.</em>
        </h2>
        <div className="ft-cta-side">
          <p>Stop managing five separate subscriptions. Start on Kwoat free — no card needed.</p>
          <div className="ft-btns">
            <Btn to="/signup" variant="signal">
              Start for free
            </Btn>
            <Btn href="#top" variant="line" onClick={() => scrollToTarget(0)}>
              Back to top
            </Btn>
          </div>
        </div>
      </div>

      <div className="ft-grid container">
        <div className="ft-brand">
          <Wordmark />
          <p className="label">AI models, one platform.</p>
        </div>
        <nav className="ft-cols" aria-label="Footer">
          <div>
            <span className="label">Product</span>
            <a href="#ensemble">Models</a>
            <a href="#board">Routing</a>
            <a href="#pricing">Pricing</a>
            <Link to="/app">Open app</Link>
          </div>
          <div>
            <span className="label">Company</span>
            <a href="#top">Docs</a>
            <a href="#top">Changelog</a>
            <a href="#top">Contact</a>
          </div>
          <div>
            <span className="label">Legal</span>
            <a href="#top">Privacy</a>
            <a href="#top">Terms</a>
            <a href="#top">Cookies</a>
          </div>
        </nav>
        <div className="ft-clocks">
          {CITIES.map(([city, tz]) => (
            <div key={city}>
              <span className="label">{city}</span>
              <span className="ft-time">{now.toLocaleTimeString('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="ft-band">
        <DitherField density={1} cell={4} className="ft-dither" fadeLeft={false} />
        <div className="ft-word display" aria-hidden>
          Kwoat
        </div>
      </div>
      <div className="ft-bottom container label">
        <span>© {now.getFullYear()} Kwoat Technologies, LLC</span>
        <span>Made for people who’d rather be doing</span>
      </div>
    </footer>
  )
}
