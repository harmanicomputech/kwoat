import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, SplitText } from '../lib/motion'
import { DitherField } from '../components/DitherField'
import { Device } from './Device'
import { Btn } from '../components/ui'

export function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ready) return
    const ctx = gsap.context(() => {
      const h = SplitText.create('.hero-h .ln', { type: 'chars', charsClass: 'ch', mask: 'chars' })
      gsap
        .timeline({ defaults: { ease: 'kwoat' } })
        .from('.dither', { opacity: 0, duration: 1.6, ease: 'power2.out' }, 0)
        .from(h.chars, { yPercent: 105, duration: 1.5, stagger: 0.028 }, 0.1)
        .from('.hero-meta > *', { y: 16, opacity: 0, duration: 1, stagger: 0.08 }, 0.5)
        .from('.hero-sub', { y: 20, opacity: 0, duration: 1.2 }, 0.7)
        .from('.hero-cta > *', { y: 20, opacity: 0, duration: 1, stagger: 0.08 }, 0.85)
        .from('.k1', { y: 80, rotate: 4, opacity: 0, duration: 1.8 }, 0.5)
        .from('.hero-foot > *', { opacity: 0, duration: 1, stagger: 0.1 }, 1.1)
    }, root)
    return () => ctx.revert()
  }, [ready])

  useEffect(() => {
    const mm = gsap.matchMedia()
    const ctx = gsap.context(() => {
      mm.add('(min-width: 1000px)', () => {
        gsap.to('.hero-h', {
          yPercent: -18,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
        })
        gsap.to('.k1-wrap', {
          yPercent: 14,
          rotate: -3,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
        })
      })
    }, root)
    ScrollTrigger.refresh()
    return () => {
      ctx.revert()
      mm.revert()
    }
  }, [])

  return (
    <section ref={root} className="hero" id="top">
      <DitherField />
      <div className="hero-grid container">
        <div className="hero-copy">
          <div className="hero-meta">
            <span className="label">
              <span className="led blink" /> Public beta
            </span>
            <span className="label">GPT · Claude · Gemini · Grok · +9</span>
          </div>
          <h1 className="hero-h display">
            <span className="ln">Stop</span>
            <span className="ln">
              <em>choosing.</em>
            </span>
            <span className="ln">
              Start <span className="signal">doing.</span>
            </span>
          </h1>
          <p className="hero-sub">
            One prompt box for every frontier AI model. Kwoat reads what you ask, routes it to the model that answers it best, and
            shows you what it cost — down to the credit.
          </p>
          <div className="hero-cta">
            <Btn to="/signup">Start free</Btn>
            <Btn href="#board" variant="line">
              Watch it route
            </Btn>
          </div>
        </div>
        <div className="k1-wrap">
          <Device />
          <p className="k1-hint label">↻ Turn the dial · press send</p>
        </div>
      </div>
      <div className="hero-foot container">
        <span className="label">
          <b>50</b> free credits daily
        </span>
        <span className="label">No card needed</span>
        <span className="label">Pay only for what you use</span>
        <span className="label hero-scroll">
          Scroll <i />
        </span>
      </div>
    </section>
  )
}
