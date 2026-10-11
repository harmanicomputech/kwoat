import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from '../lib/motion'
import { Rays } from '../components/Rays'
import { Arrow, Icon, Logo, Magnetic, Mark } from '../components/ui'
import { useInView, useSpotlight } from '../lib/hooks'
import { PLANS } from '../api'

/* ---------------- Product tour: the client's own screenshots ---------------- */

const TOUR = [
  { k: 'Compare', src: '/shots/compare_panel.png', d: 'Pick up to four models across Standard, Advanced and Premium, then run them side by side.' },
  { k: 'Documents', src: '/shots/document_html.webp', d: 'Ask for a page, a deck or a report — Kwoat builds it and renders a live preview.' },
  { k: 'Gallery', src: '/shots/gallery_image.webp', d: 'Every image you generate is filed automatically, ready to vary or download.' },
  { k: 'Missions', src: '/shots/missions.png', d: 'Watch the agent plan, write files and test them in its sandbox, step by step.' },
  { k: 'Voice', src: '/shots/voice_live_mode.png', d: 'A live, two-way call. The transcript lands in your chat when you hang up.' },
  { k: 'Usage', src: '/shots/usage_analytics.png', d: 'Spend by model, feature and day — every credit accounted for.' },
]
const TOUR_MS = 5200

export function Tour() {
  const [i, setI] = useState(0)
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.3 })
  const img = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!inView) return
    const t = setTimeout(() => setI((x) => (x + 1) % TOUR.length), TOUR_MS)
    return () => clearTimeout(t)
  }, [i, inView])
  useEffect(() => {
    if (img.current) gsap.fromTo(img.current, { opacity: 0, scale: 1.02, filter: 'blur(8px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.9, ease: 'kwoat' })
  }, [i])
  return (
    <section className="tour">
      <div className="container">
        <div className="sec-head">
          <span className="kicker">Inside the app</span>
          <h2 className="h-lg metal">Built for doing, not choosing.</h2>
        </div>
        <div ref={ref} className="tour-grid">
          <div className="tour-tabs" role="tablist">
            {TOUR.map((t, k) => (
              <button key={t.k} role="tab" aria-selected={k === i} className={k === i ? 'is-on' : ''} onClick={() => setI(k)}>
                <span className="tour-k">{t.k}</span>
                <span className="tour-d">{t.d}</span>
                <i className="tour-bar">
                  <b key={`${i}-${k}`} style={{ animationDuration: `${TOUR_MS}ms`, animationPlayState: k === i && inView ? 'running' : 'paused' }} />
                </i>
              </button>
            ))}
          </div>
          <div className="tour-frame panel">
            <div className="tour-chrome">
              <span />
              <span />
              <span />
              <div className="mono">kwoat.ai/app/{TOUR[i].k.toLowerCase()}</div>
            </div>
            <div ref={img} className="tour-img" key={i}>
              <img src={TOUR[i].src} alt={`Kwoat ${TOUR[i].k} screen`} loading="lazy" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Testimonials ---------------- */

const QUOTES = [
  { q: 'Really fast — way quicker than switching between tabs.', r: 'Product designer' },
  { q: 'Exactly what I was looking for. One place for everything.', r: 'Founder' },
  { q: 'The UI/UX is so beautiful. Feels premium.', r: 'Software engineer' },
]

export function Voices() {
  const root = useRef<HTMLElement>(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.q', { y: 30, opacity: 0, filter: 'blur(6px)', duration: 1.2, ease: 'kwoat', stagger: 0.12, scrollTrigger: { trigger: '.q-grid', start: 'top 80%' } })
    }, root)
    return () => ctx.revert()
  }, [])
  return (
    <section ref={root} className="voices">
      <div className="container">
        <div className="sec-head">
          <span className="kicker">Early users</span>
          <h2 className="h-lg metal">What the beta is saying.</h2>
        </div>
        <div className="q-grid">
          {QUOTES.map((q) => (
            <figure className="q panel" key={q.q}>
              <blockquote>“{q.q}”</blockquote>
              <figcaption>
                <span className="q-av">
                  <Mark size={14} />
                </span>
                <span>
                  <b>Beta user</b>
                  <small>{q.r}</small>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- Pricing ---------------- */

function Num({ v }: { v: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const prev = useRef(v)
  useEffect(() => {
    const o = { x: prev.current }
    const fmt = (n: number) => (v % 1 === 0 ? Math.round(n).toLocaleString('en-US') : n.toFixed(2))
    const tw = gsap.to(o, { x: v, duration: 0.8, ease: 'expo.out', onUpdate: () => ref.current && (ref.current.textContent = fmt(o.x)) })
    prev.current = v
    return () => {
      tw.kill()
    }
  }, [v])
  return <span ref={ref}>{v.toLocaleString('en-US')}</span>
}

export function Pricing() {
  const [yearly, setYearly] = useState(false)
  const spot = useSpotlight<HTMLDivElement>()
  const root = useRef<HTMLElement>(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.plan', { y: 40, opacity: 0, filter: 'blur(8px)', duration: 1.2, ease: 'kwoat', stagger: 0.08, scrollTrigger: { trigger: '.plans', start: 'top 80%' } })
    }, root)
    return () => ctx.revert()
  }, [])
  return (
    <section ref={root} className="pricing" id="pricing">
      <div className="container">
        <div className="sec-head">
          <span className="kicker">Pricing</span>
          <h2 className="h-lg metal">Start free. Scale when ready.</h2>
          <p className="lede">See the cost of every response. No surprise bills. Cancel any time.</p>
          <div className="seg-toggle" role="radiogroup" aria-label="Billing period">
            <i style={{ transform: `translateX(${yearly ? 100 : 0}%)` }} />
            <button role="radio" aria-checked={!yearly} onClick={() => setYearly(false)}>
              Monthly
            </button>
            <button role="radio" aria-checked={yearly} onClick={() => setYearly(true)}>
              Yearly <span className="save">1 month free</span>
            </button>
          </div>
        </div>
        <div ref={spot} className="plans">
          {PLANS.map((p) => {
            const featured = p.id === 'pro'
            const price = yearly ? p.yearly : p.monthly
            return (
              <article key={p.id} className={`plan panel spot ${featured ? 'is-featured' : ''}`}>
                {featured && <span className="plan-ring" aria-hidden />}
                <div className="plan-head">
                  <h3>{p.name}</h3>
                  {p.badge && <span className={`plan-badge ${featured ? 'is-violet' : ''}`}>{p.badge}</span>}
                </div>
                <p className="plan-tag">{p.tagline}</p>
                <div className="plan-price">
                  {price === 0 ? (
                    <span className="plan-free">Free</span>
                  ) : (
                    <>
                      <span className="plan-cur">$</span>
                      <Num v={price} />
                      <span className="plan-per">/{yearly ? 'year' : 'month'}</span>
                    </>
                  )}
                </div>
                <p className="plan-note">{price === 0 ? 'Then wallet-based · no subscription' : yearly ? `$${(p.yearly / 12).toFixed(2)} per month, billed yearly` : 'Billed monthly'}</p>
                <Magnetic to={`/signup?plan=${p.id}`} className={`btn ${featured ? 'btn-primary' : 'btn-ghost'} plan-cta`}>
                  {p.cta}
                </Magnetic>
                <ul>
                  {p.features.map((f) => (
                    <li key={f}>
                      <Icon name="check" size={14} />
                      {f}
                    </li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ---------------- FAQ ---------------- */

const FAQS = [
  ['How does Kwoat choose a model?', 'It reads your prompt — the task, the language, how hard it is — and sends it to the model that handles that kind of request best at the lowest cost that does the job well. You can always pick a model yourself.'],
  ['What is a credit?', 'Credits are how Kwoat prices each reply. Simple questions on fast models cost about 1 credit; heavy reasoning or premium models cost more. Every response shows exactly what it used.'],
  ['Do credits expire?', 'Free daily credits reset every day. Credits you top up in your wallet never expire.'],
  ['Which models are included?', 'GPT, Claude, Gemini, Grok, Llama, Mistral, FLUX and Nano Banana, among others. Claude Sonnet and Opus are included from the Pro plan.'],
  ['Can I cancel any time?', 'Yes. Plans are month to month (or yearly with a month free), and your wallet balance stays yours.'],
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="faq" id="faq">
      <div className="container faq-grid">
        <div>
          <span className="kicker">FAQ</span>
          <h2 className="h-lg metal">Questions, answered.</h2>
          <p className="lede">
            Anything else? <a href="mailto:hello@kwoat.ai">Talk to us</a>.
          </p>
        </div>
        <div className="faq-list">
          {FAQS.map(([q, a], i) => (
            <div key={q} className={`faq-item ${open === i ? 'is-open' : ''}`}>
              <button aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
                {q}
                <span className="faq-plus" aria-hidden />
              </button>
              <div className="faq-a">
                <p>{a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ---------------- CTA + Footer ---------------- */

export function Finale() {
  return (
    <section className="finale">
      <Rays focal={[0.5, 0.28]} intensity={0.9} className="finale-rays" />
      <div className="finale-fade" />
      <div className="container finale-inner">
        <Mark size={44} className="finale-mark" />
        <h2 className="h-xl metal">
          Every AI model.
          <br />
          One wallet.
        </h2>
        <p className="lede">Stop managing five separate subscriptions. Start on Kwoat free — no card needed.</p>
        <div className="finale-actions">
          <Magnetic to="/signup" className="btn btn-white btn-lg">
            Start for free <Arrow />
          </Magnetic>
          <Magnetic href="#faq" className="btn btn-ghost btn-lg">
            Read the docs
          </Magnetic>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="container foot-top">
        <div className="foot-brand">
          <Logo />
          <p>AI models, one platform.</p>
          <span className="chip">
            <span className="dot pulse" style={{ background: 'var(--ok)' }} /> All models operational
          </span>
        </div>
        <nav className="foot-cols" aria-label="Footer">
          <div>
            <h4>Product</h4>
            <a href="#product">Overview</a>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <Link to="/app">Open app</Link>
          </div>
          <div>
            <h4>Resources</h4>
            <a href="#faq">Docs</a>
            <a href="#faq">FAQ</a>
            <a href="#top">Changelog</a>
          </div>
          <div>
            <h4>Legal</h4>
            <a href="#top">Privacy</a>
            <a href="#top">Terms</a>
            <a href="#top">Cookies</a>
          </div>
        </nav>
      </div>
      <div className="container foot-bottom">
        <span>© {new Date().getFullYear()} Kwoat Technologies, LLC</span>
        <span>Stop choosing. Start doing.</span>
      </div>
      <div className="foot-mark" aria-hidden>
        <Mark size={560} />
      </div>
    </footer>
  )
}
