import { useEffect, useState } from 'react'
import { ScrollTrigger, startSmoothScroll, stopSmoothScroll } from '../lib/motion'
import { Preloader } from '../landing/Preloader'
import { Nav } from '../landing/Nav'
import { Hero } from '../landing/Hero'
import { Marquee } from '../landing/Marquee'
import { Routing } from '../landing/Routing'
import { Features } from '../landing/Features'
import { Manifesto, Stats, Testimonials } from '../landing/Story'
import { Pricing } from '../landing/Pricing'
import { CTA, Footer } from '../landing/Finale'
import '../styles/landing.css'

export default function Landing() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    startSmoothScroll()
    const t = setTimeout(() => ScrollTrigger.refresh(), 500)
    return () => {
      clearTimeout(t)
      stopSmoothScroll()
    }
  }, [])

  return (
    <div className="landing">
      <Preloader onDone={() => setReady(true)} />
      <Nav />
      <main>
        <Hero ready={ready} />
        <Marquee />
        <Routing />
        <Features />
        <Manifesto />
        <Stats />
        <Testimonials />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
