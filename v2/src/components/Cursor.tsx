import { useEffect, useRef } from 'react'
import { gsap, isTouch, prefersReducedMotion } from '../lib/motion'

// Crosshair cursor with a live coordinate readout. Over links it becomes a
// solid signal block; `data-cursor="Label"` shows a word inside it.
export function Cursor() {
  const root = useRef<HTMLDivElement>(null)
  const coords = useRef<HTMLSpanElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (isTouch() || prefersReducedMotion()) return
    const el = root.current!
    document.documentElement.classList.add('has-cursor')
    const x = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3' })
    const y = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3' })
    const move = (e: PointerEvent) => {
      x(e.clientX)
      y(e.clientY)
      if (coords.current) coords.current.textContent = `${String(e.clientX).padStart(4, '0')} · ${String(e.clientY).padStart(4, '0')}`
    }
    const over = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>('a, button, [data-cursor], input, textarea, label')
      const text = t?.dataset.cursor
      const isField = !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')
      el.classList.toggle('is-link', !!t && !isField && !text)
      el.classList.toggle('is-label', !!text)
      el.classList.toggle('is-field', isField)
      if (label.current) label.current.textContent = text ?? ''
    }
    const down = () => el.classList.add('is-down')
    const up = () => el.classList.remove('is-down')
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerover', over)
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    return () => {
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
    }
  }, [])

  return (
    <div ref={root} className="xh" aria-hidden>
      <i className="xh-h" />
      <i className="xh-v" />
      <span className="xh-box">
        <span ref={label} />
      </span>
      <span ref={coords} className="xh-coords" />
    </div>
  )
}
