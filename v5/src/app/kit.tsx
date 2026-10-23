// Small building blocks shared by the app screens.
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from '../lib/motion'
import { Icon } from '../components/ui'

/** A number that rolls to its new value. */
export function Count({ value, format = (n) => Math.round(n).toLocaleString(), duration = 1 }: { value: number; format?: (n: number) => string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const from = useRef(0)
  useEffect(() => {
    const o = { v: from.current }
    const tw = gsap.to(o, {
      v: value,
      duration,
      ease: 'power3.out',
      onUpdate: () => {
        if (ref.current) ref.current.textContent = format(o.v)
      },
    })
    from.current = value
    return () => {
      tw.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
  return <span ref={ref}>{format(0)}</span>
}

/** Segmented tabs with a pill that slides to the active option. */
export function Seg<T extends string>({ options, value, onChange, small }: { options: { id: T; label: ReactNode }[]; value: T; onChange: (v: T) => void; small?: boolean }) {
  const root = useRef<HTMLDivElement>(null)
  const pill = useRef<HTMLSpanElement>(null)
  const first = useRef(true)
  useLayoutEffect(() => {
    const btn = root.current?.querySelector<HTMLElement>(`[data-id="${value}"]`)
    if (!btn || !pill.current) return
    const to = { x: btn.offsetLeft, width: btn.offsetWidth }
    if (first.current) gsap.set(pill.current, to)
    else gsap.to(pill.current, { ...to, duration: 0.55, ease: 'kwoat' })
    first.current = false
  }, [value])
  return (
    <div ref={root} className={`k-seg ${small ? 'sm' : ''}`} role="tablist">
      <span ref={pill} className="k-seg-pill" aria-hidden />
      {options.map((o) => (
        <button key={o.id} data-id={o.id} role="tab" aria-selected={o.id === value} className={o.id === value ? 'on' : ''} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** Centered dialog: blurred backdrop, springy entrance, Esc / backdrop to close. */
export function Modal({ open, onClose, children, className = '', label }: { open: boolean; onClose: () => void; children: ReactNode; className?: string; label: string }) {
  const [mounted, setMounted] = useState(open)
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (open) setMounted(true)
    else if (mounted && root.current) {
      const tl = gsap.timeline({ onComplete: () => setMounted(false) })
      tl.to(root.current.querySelector('.k-modal'), { y: 16, scale: 0.96, opacity: 0, duration: 0.25, ease: 'power2.in' })
      tl.to(root.current, { opacity: 0, duration: 0.2 }, '<0.05')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])
  useLayoutEffect(() => {
    if (!mounted || !open || !root.current) return
    gsap.fromTo(root.current, { opacity: 0 }, { opacity: 1, duration: 0.3 })
    gsap.fromTo(root.current.querySelector('.k-modal'), { y: 30, scale: 0.94, opacity: 0, rotateX: -12 }, { y: 0, scale: 1, opacity: 1, rotateX: 0, duration: 0.7, ease: 'back.out(1.4)' })
    gsap.from(root.current.querySelectorAll('.k-stagger > *'), { y: 14, opacity: 0, stagger: 0.04, duration: 0.5, ease: 'kwoat', delay: 0.12 })
  }, [mounted, open])
  useEffect(() => {
    if (!open) return
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [open, onClose])
  if (!mounted) return null
  return createPortal(
    <div ref={root} className="k-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`k-modal ${className}`} role="dialog" aria-modal aria-label={label}>
        {children}
      </div>
    </div>,
    document.body,
  )
}

/** Closes a popover on outside click or Esc. */
export function useDismiss<T extends HTMLElement>(open: boolean, close: () => void) {
  const ref = useRef<T>(null)
  useEffect(() => {
    if (!open) return
    const down = (e: PointerEvent) => ref.current && !ref.current.contains(e.target as Node) && close()
    const key = (e: KeyboardEvent) => e.key === 'Escape' && close()
    setTimeout(() => window.addEventListener('pointerdown', down))
    window.addEventListener('keydown', key)
    return () => {
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('keydown', key)
    }
  }, [open, close])
  return ref
}

/** Pops a popover in when it mounts. */
export function usePop<T extends HTMLElement>(open: boolean, from: gsap.TweenVars = { y: -8 }) {
  const ref = useRef<T>(null)
  useLayoutEffect(() => {
    if (!open || !ref.current) return
    gsap.fromTo(ref.current, { opacity: 0, scale: 0.94, ...from }, { opacity: 1, scale: 1, x: 0, y: 0, duration: 0.45, ease: 'back.out(1.6)' })
    gsap.from(ref.current.querySelectorAll('.pop-item'), { opacity: 0, x: -8, stagger: 0.035, duration: 0.35, ease: 'kwoat', delay: 0.05 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])
  return ref
}

/** Generated artwork placeholder until real image URLs exist: layered colour fields seeded by hue. */
export function Art({ hue, className = '' }: { hue: number; className?: string }) {
  return (
    <div className={`k-art ${className}`} style={{ ['--h' as string]: hue }}>
      <i />
      <i />
      <i />
    </div>
  )
}

export function Empty({ icon, title, text, children }: { icon: Parameters<typeof Icon>[0]['name']; title: string; text: string; children?: ReactNode }) {
  return (
    <div className="k-empty">
      <div className="k-empty-ico">
        <span className="k-empty-ring" />
        <span className="k-empty-ring r2" />
        <Icon name={icon} size={28} />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      {children}
    </div>
  )
}

/** Reveals page children with a stagger on mount. */
export function usePageIn<T extends HTMLElement>(selector = '.reveal') {
  const ref = useRef<T>(null)
  useLayoutEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(selector, { y: 28, opacity: 0, filter: 'blur(6px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', stagger: 0.07, duration: 0.9, ease: 'kwoat', clearProps: 'transform,opacity,filter' })
    }, ref)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return ref
}

export function timeAgo(t: number) {
  const s = (Date.now() - t) / 1000
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
