import { useEffect } from 'react'
import { ScrollTrigger, startSmoothScroll, stopSmoothScroll } from '../lib/motion'
import { Nav } from '../landing/Nav'
import { Hero } from '../landing/Hero'
import { Product } from '../landing/Product'
import { Routing } from '../landing/Routing'
import { Features } from '../landing/Features'
import { Wallet } from '../landing/Wallet'
import { FAQ, Finale, Footer, Pricing, Tour, Voices } from '../landing/Closing'
import '../styles/landing.css'

export default function Landing() {
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
      <Nav />
      <main>
        <Hero />
        <Product />
        <Routing />
        <Features />
        <Wallet />
        <Tour />
        <Voices />
        <Pricing />
        <FAQ />
        <Finale />
      </main>
      <Footer />
    </div>
  )
}
