import { useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger, SplitText, prefersReducedMotion, startSmoothScroll, stopSmoothScroll } from '../lib/motion'
import { Nav } from '../site/Nav'
import { Hero } from '../site/Hero'
import { Logos } from '../site/Logos'
import { Routing } from '../site/Routing'
import { Bento } from '../site/Bento'
import { Steps } from '../site/Steps'
import { Models } from '../site/Models'
import { Testimonials } from '../site/Testimonials'
import { Pricing } from '../site/Pricing'
import { AppBand } from '../site/AppBand'
import { Faq } from '../site/Faq'
import { Footer } from '../site/Footer'
import '../styles/site.css'

export default function Landing() {
  const root = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    startSmoothScroll()
    if (prefersReducedMotion()) return () => stopSmoothScroll()
    const splits: SplitText[] = []
    const ctx = gsap.context(() => {
      // Section headings rise word by word as they enter
      gsap.utils.toArray<HTMLElement>('[data-split]').forEach((el) => {
        const s = new SplitText(el, { type: 'words', mask: 'words', wordsClass: 'w' })
        splits.push(s)
        gsap.from(s.words, { yPercent: 110, duration: 1, ease: 'kwoat', stagger: 0.05, scrollTrigger: { trigger: el, start: 'top 88%' } })
      })
      // Everything else marked for reveal fades up in groups
      ScrollTrigger.batch('[data-reveal]', {
        start: 'top 90%',
        once: true,
        onEnter: (els) => gsap.fromTo(els, { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'kwoat', stagger: 0.08, overwrite: true }),
      })
      gsap.set('[data-reveal]', { opacity: 0 })
    }, root)
    requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => {
      ctx.revert()
      splits.forEach((s) => s.revert())
      stopSmoothScroll()
    }
  }, [])

  return (
    <div ref={root} className="s5">
      <Nav />
      <main>
        <Hero />
        <Logos />
        <Routing />
        <Bento />
        <Steps />
        <Models />
        <Testimonials />
        <Pricing />
        <AppBand />
        <Faq />
      </main>
      <Footer />
    </div>
  )
}
