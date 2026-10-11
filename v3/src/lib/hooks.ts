import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, isTouch, prefersReducedMotion } from './motion'

export const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/** Runs GSAP code scoped to a ref and reverts everything on unmount. */
export function useGsap<T extends HTMLElement>(fn: (root: T) => void | (() => void), deps: unknown[] = []) {
  const ref = useRef<T>(null)
  useIsoLayoutEffect(() => {
    if (!ref.current) return
    let cleanup: void | (() => void)
    const ctx = gsap.context(() => {
      cleanup = fn(ref.current as T)
    }, ref)
    return () => {
      cleanup?.()
      ctx.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return ref
}

/** Element drifts toward the pointer while hovered, then springs back. */
export function useMagnetic<T extends HTMLElement>(strength = 0.35) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || isTouch() || prefersReducedMotion()) return
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' })
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      xTo((e.clientX - (r.left + r.width / 2)) * strength)
      yTo((e.clientY - (r.top + r.height / 2)) * strength)
    }
    const leave = () => {
      xTo(0)
      yTo(0)
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [strength])
  return ref
}

/** Sets --mx/--my on every .spotlight inside the root so borders glow under the cursor. */
export function useSpotlight<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const root = ref.current
    if (!root) return
    const move = (e: PointerEvent) => {
      root.querySelectorAll<HTMLElement>('.spotlight').forEach((el) => {
        const r = el.getBoundingClientRect()
        el.style.setProperty('--mx', `${e.clientX - r.left}px`)
        el.style.setProperty('--my', `${e.clientY - r.top}px`)
      })
    }
    root.addEventListener('pointermove', move)
    return () => root.removeEventListener('pointermove', move)
  }, [])
  return ref
}

/** 3D tilt toward the pointer. */
export function useTilt<T extends HTMLElement>(max = 10) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || isTouch() || prefersReducedMotion()) return
    gsap.set(el, { transformPerspective: 900 })
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.5, ease: 'power3' })
    const ry = gsap.quickTo(el, 'rotationY', { duration: 0.5, ease: 'power3' })
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      ry(px * max * 2)
      rx(-py * max * 2)
      el.style.setProperty('--px', `${(px + 0.5) * 100}%`)
      el.style.setProperty('--py', `${(py + 0.5) * 100}%`)
    }
    const leave = () => {
      rx(0)
      ry(0)
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [max])
  return ref
}

/** Cycles through strings, typing and deleting them. */
export function useTypewriter(words: string[], { type = 45, erase = 22, hold = 1800 } = {}) {
  const [text, setText] = useState('')
  const [index, setIndex] = useState(0)
  useEffect(() => {
    let cancelled = false
    let t: ReturnType<typeof setTimeout>
    const word = words[index % words.length]
    let i = 0
    const typeNext = () => {
      if (cancelled) return
      i++
      setText(word.slice(0, i))
      if (i < word.length) t = setTimeout(typeNext, type + Math.random() * 40)
      else t = setTimeout(eraseNext, hold)
    }
    const eraseNext = () => {
      if (cancelled) return
      i--
      setText(word.slice(0, i))
      if (i > 0) t = setTimeout(eraseNext, erase)
      else setIndex((n) => n + 1)
    }
    t = setTimeout(typeNext, 300)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [index, words, type, erase, hold])
  return { text, index: index % words.length }
}

export function useInView<T extends HTMLElement>(options: IntersectionObserverInit = { threshold: 0.2 }) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), options)
    io.observe(el)
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return [ref, inView] as const
}
