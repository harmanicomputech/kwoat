import { useEffect, useState } from 'react'
import { ScrollTrigger, startSmoothScroll, stopSmoothScroll } from '../lib/motion'
import { Loader } from '../landing/Loader'
import { Nav } from '../landing/Nav'
import { Hero } from '../landing/Hero'
import { Ensemble } from '../landing/Ensemble'
import { Board } from '../landing/Board'
import { Stack } from '../landing/Stack'
import { Footer, Pricing, Statement, Voices } from '../landing/Closing'
import '../styles/landing.css'

export default function Landing() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    startSmoothScroll()
    const t = setTimeout(() => ScrollTrigger.refresh(), 600)
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    return () => {
      clearTimeout(t)
      stopSmoothScroll()
    }
  }, [])
  return (
    <div className="landing">
      <Loader onDone={() => setReady(true)} />
      <Nav />
      <main>
        <Hero ready={ready} />
        <Ensemble />
        <Board />
        <Stack />
        <Statement />
        <Pricing />
        <Voices />
      </main>
      <Footer />
    </div>
  )
}
