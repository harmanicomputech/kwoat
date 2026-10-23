import { useEffect, useRef } from 'react'
import { gsap, isTouch, prefersReducedMotion } from '../lib/motion'

// A dot + trailing ring. Elements opt into states with data attributes:
//   data-cursor="hover"            → ring grows
//   data-cursor-label="Drag"       → ring shows a label
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (isTouch() || prefersReducedMotion()) return
    document.documentElement.classList.add('has-cursor')
    const d = dot.current!
    const r = ring.current!
    const dx = gsap.quickTo(d, 'x', { duration: 0.08 })
    const dy = gsap.quickTo(d, 'y', { duration: 0.08 })
    const rx = gsap.quickTo(r, 'x', { duration: 0.45, ease: 'power3' })
    const ry = gsap.quickTo(r, 'y', { duration: 0.45, ease: 'power3' })

    const move = (e: PointerEvent) => {
      dx(e.clientX)
      dy(e.clientY)
      rx(e.clientX)
      ry(e.clientY)
    }
    const over = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>('a, button, [data-cursor], [data-cursor-label], input, textarea')
      const text = t?.dataset.cursorLabel
      r.classList.toggle('is-hover', !!t && !text)
      r.classList.toggle('is-label', !!text)
      if (label.current) label.current.textContent = text ?? ''
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) r.classList.add('is-text')
      else r.classList.remove('is-text')
    }
    const down = () => r.classList.add('is-down')
    const up = () => r.classList.remove('is-down')
    const leave = () => gsap.to([d, r], { opacity: 0, duration: 0.3 })
    const enter = () => gsap.to([d, r], { opacity: 1, duration: 0.3 })

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerover', over)
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    document.addEventListener('pointerleave', leave)
    document.addEventListener('pointerenter', enter)
    return () => {
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.removeEventListener('pointerleave', leave)
      document.removeEventListener('pointerenter', enter)
    }
  }, [])

  return (
    <>
      <div ref={dot} className="cursor-dot" aria-hidden />
      <div ref={ring} className="cursor-ring" aria-hidden>
        <span ref={label} />
      </div>
    </>
  )
}
