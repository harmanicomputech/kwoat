import { useEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'
import { SplitFlap } from '../components/SplitFlap'

const WORDS = ['GPT-5.4', 'CLAUDE', 'GEMINI', 'GROK', 'FLUX', 'LLAMA', 'KWOAT']

/** Split-flap board that cycles model names, then the panel lifts away in strips. */
export function Loader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const [word, setWord] = useState('')
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const el = root.current!
    let seen = false
    try {
      seen = sessionStorage.getItem('kwoat2-loaded') === '1'
    } catch {
      /* ignore */
    }
    if (seen || prefersReducedMotion()) {
      el.remove()
      onDone()
      return
    }
    document.documentElement.style.overflow = 'hidden'
    let i = 0
    const id = setInterval(() => setWord(WORDS[Math.min(i++, WORDS.length - 1)]), 360)
    const state = { p: 0 }
    const tl = gsap.timeline({
      onComplete: () => {
        document.documentElement.style.overflow = ''
        try {
          sessionStorage.setItem('kwoat2-loaded', '1')
        } catch {
          /* ignore */
        }
        el.remove()
      },
    })
    tl.to(state, { p: 100, duration: 2.7, ease: 'power1.inOut', onUpdate: () => setPct(Math.round(state.p)) })
      .add(() => clearInterval(id))
      .to('.ld-inner', { opacity: 0, y: -20, duration: 0.4, ease: 'power2.in' }, '+=0.35')
      .to('.ld-strip', { scaleY: 0, transformOrigin: 'top', duration: 0.9, ease: 'expo.inOut', stagger: { each: 0.06, from: 'start' } })
      .add(onDone, '-=0.6')
    return () => {
      clearInterval(id)
      tl.kill()
      document.documentElement.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={root} className="loader" aria-hidden>
      {Array.from({ length: 6 }).map((_, i) => (
        <i key={i} className="ld-strip" style={{ gridColumn: i + 1 }} />
      ))}
      <div className="ld-inner">
        <div className="ld-row label">
          <span>Kwoat® routing system</span>
          <span>Board 01</span>
        </div>
        <SplitFlap value={word} length={7} className="flap-xl" speed={26} stagger={1} />
        <div className="ld-row label">
          <span>Warming up 13 models</span>
          <span className="ld-pct">{String(pct).padStart(3, '0')}%</span>
        </div>
        <div className="ld-bar">
          <i style={{ transform: `scaleX(${pct / 100})` }} />
        </div>
      </div>
    </div>
  )
}
