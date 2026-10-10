import { useEffect, useRef } from 'react'
import { gsap, SplitText } from '../lib/motion'
import { useTilt } from '../lib/hooks'

/** Words light up one by one as you scroll through. */
export function Manifesto() {
  const root = useRef<HTMLElement>(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      const split = SplitText.create('.mf-text', { type: 'words', wordsClass: 'mf-w' })
      gsap.fromTo(
        split.words,
        { opacity: 0.12, filter: 'blur(4px)' },
        {
          opacity: 1,
          filter: 'blur(0px)',
          stagger: 0.05,
          ease: 'none',
          scrollTrigger: { trigger: '.mf-text', start: 'top 80%', end: 'bottom 45%', scrub: true },
        },
      )
      gsap.to('.mf-orb', {
        yPercent: -60,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
      })
    }, root)
    return () => ctx.revert()
  }, [])
  return (
    <section ref={root} className="manifesto">
      <div className="mf-orb" aria-hidden />
      <div className="container">
        <span className="eyebrow">Why Kwoat</span>
        <p className="mf-text">
          Five subscriptions. Five tabs. Five bills. And you still don’t know if you picked the right model. Kwoat puts every
          frontier AI behind one prompt box, routes each question to the model that answers it best, and shows you the cost of
          every single reply. Stop choosing. Start doing.
        </p>
      </div>
    </section>
  )
}

const STATS = [
  { value: 13, suffix: '+', label: 'Frontier models' },
  { value: 50, suffix: '', label: 'Free credits every day' },
  { value: 0.4, suffix: 's', label: 'Average routing time', decimals: 1 },
  { value: 5, suffix: '→1', label: 'Subscriptions replaced' },
]

export function Stats() {
  const root = useRef<HTMLElement>(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.st-num').forEach((el, i) => {
        const s = STATS[i]
        const o = { v: 0 }
        gsap.to(o, {
          v: s.value,
          duration: 2,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
          onUpdate: () => (el.textContent = o.v.toFixed(s.decimals ?? 0)),
        })
      })
      gsap.from('.st-item', {
        y: 60,
        opacity: 0,
        stagger: 0.12,
        duration: 1.1,
        ease: 'kwoat',
        scrollTrigger: { trigger: root.current, start: 'top 80%' },
      })
    }, root)
    return () => ctx.revert()
  }, [])
  return (
    <section ref={root} className="stats">
      <div className="container st-grid">
        {STATS.map((s) => (
          <div className="st-item" key={s.label}>
            <div className="st-value">
              <span className="st-num">0</span>
              <span className="st-suffix">{s.suffix}</span>
            </div>
            <div className="st-label">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

const QUOTES = [
  { q: 'Really fast — way quicker than switching between tabs.', who: 'Beta user', role: 'Product designer' },
  { q: 'Exactly what I was looking for. One place for everything.', who: 'Beta user', role: 'Founder' },
  { q: 'The UI/UX is so beautiful. Feels premium.', who: 'Beta user', role: 'Engineer' },
]

function Quote({ q, who, role, i }: { q: string; who: string; role: string; i: number }) {
  const ref = useTilt<HTMLElement>(8)
  return (
    <figure ref={ref} className="tm-card card" data-cursor="hover" style={{ ['--i' as string]: i }}>
      <div className="tm-shine" />
      <span className="tm-mark serif">“</span>
      <blockquote>{q}</blockquote>
      <figcaption>
        <span className="tm-avatar">{role[0]}</span>
        <span>
          <b>{who}</b>
          <small>{role}</small>
        </span>
      </figcaption>
    </figure>
  )
}

export function Testimonials() {
  const root = useRef<HTMLElement>(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.tm-card', {
        y: 120,
        rotate: (i) => [-6, 2, 7][i],
        opacity: 0,
        stagger: 0.15,
        duration: 1.3,
        ease: 'kwoat',
        scrollTrigger: { trigger: root.current, start: 'top 75%' },
      })
    }, root)
    return () => ctx.revert()
  }, [])
  return (
    <section ref={root} className="testimonials">
      <div className="container">
        <span className="eyebrow">What early users are saying</span>
        <div className="tm-grid">
          {QUOTES.map((x, i) => (
            <Quote key={i} {...x} i={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
