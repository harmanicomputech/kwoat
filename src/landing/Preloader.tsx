import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'
import { Logo } from '../components/ui'

const WORDS = ['GPT', 'Claude', 'Gemini', 'Grok', 'FLUX', 'Llama', 'Mistral', 'Kwoat']

/** Counter + flashing model names, then the curtain splits open. Calls onDone when the page should animate in. */
export function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current!
    if (prefersReducedMotion() || sessionStorageSeen()) {
      el.remove()
      onDone()
      return
    }
    document.documentElement.style.overflow = 'hidden'
    const count = el.querySelector('.pl-count')!
    const word = el.querySelector('.pl-word')!
    const state = { n: 0 }
    const tl = gsap.timeline({
      onComplete: () => {
        document.documentElement.style.overflow = ''
        markSeen()
        el.remove()
      },
    })
    tl.from('.pl-logo path', { drawSVG: '0%', duration: 1.2, stagger: 0.08, ease: 'kwoat' })
      .to(
        state,
        {
          n: 100,
          duration: 2.2,
          ease: 'power2.inOut',
          onUpdate: () => {
            const v = Math.round(state.n)
            count.textContent = String(v).padStart(3, '0')
            word.textContent = WORDS[Math.min(WORDS.length - 1, Math.floor((v / 100) * WORDS.length))]
            gsap.set('.pl-bar i', { scaleX: v / 100 })
          },
        },
        0.2,
      )
      .to('.pl-inner', { yPercent: -30, opacity: 0, duration: 0.6, ease: 'kwoatIn' })
      .to('.pl-top', { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, '<0.1')
      .to('.pl-bottom', { yPercent: 100, duration: 1.1, ease: 'expo.inOut' }, '<')
      .add(onDone, '<0.35')
    return () => {
      tl.kill()
      document.documentElement.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={root} className="preloader" aria-hidden>
      <div className="pl-top" />
      <div className="pl-bottom" />
      <div className="pl-inner">
        <div className="pl-logo">
          <Logo size={64} withWord={false} />
        </div>
        <div className="pl-word">GPT</div>
        <div className="pl-meta">
          <span>Routing every model</span>
          <span className="pl-count">000</span>
        </div>
        <div className="pl-bar">
          <i />
        </div>
      </div>
    </div>
  )
}

function sessionStorageSeen() {
  try {
    return sessionStorage.getItem('kwoat-preloaded') === '1'
  } catch {
    return false
  }
}
function markSeen() {
  try {
    sessionStorage.setItem('kwoat-preloaded', '1')
  } catch {
    /* ignore */
  }
}
