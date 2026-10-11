import { useEffect, useState } from 'react'
import { ScrollTrigger, startSmoothScroll, stopSmoothScroll } from '../lib/motion'
import { Hero, Nav, Preloader } from '../landing/Top'
import { Logos } from '../landing/Logos'
import { How } from '../landing/How'
import { Features } from '../landing/Features'
import { Playground, Tour, Stats, Voices, FAQ, Finale, Footer } from '../landing/Rest'
import { Wallet } from '../landing/Wallet'
import { Pricing } from '../landing/Pricing'
import { AppDownload } from '../landing/AppDownload'
import '../styles/landing.css'
import '../styles/hero.css'
import '../styles/app-download.css'

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
        <Logos />
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
        <AppDownload />
      </main>
      <Footer />
    </div>
  )
}
