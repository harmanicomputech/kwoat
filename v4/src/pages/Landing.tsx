import { useEffect, useState } from 'react'
import { ScrollTrigger, startSmoothScroll, stopSmoothScroll } from '../lib/motion'
import { Hero, Nav, Preloader } from '../landing/Top'
import { Marquee } from '../landing/Marquee'
import { How } from '../landing/How'
import { Features } from '../landing/Features'
import { Playground, Tour, Stats, Voices, FAQ, Finale, Footer } from '../landing/Rest'
import { Wallet } from '../landing/Wallet'
import { Pricing } from '../landing/Pricing'
import '../styles/landing.css'
import '../styles/hero.css'

export default function Landing() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    startSmoothScroll()
    const t = setTimeout(() => ScrollTrigger.refresh(), 700)
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
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
        <How />
        <Features />
        <Playground />
        <Wallet />
        <Tour />
        <Stats />
        <Voices />
        <Pricing />
        <FAQ />
        <Finale />
      </main>
      <Footer />
    </div>
  )
}
