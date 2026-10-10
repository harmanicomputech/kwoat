import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useMagnetic } from '../lib/hooks'

/** Wordmark: a dial whose needle points at the signal. */
export function Mark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden className="mark">
      <circle cx="16" cy="16" r="12.5" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <path className="mark-needle" d="M16 16 L24 8" stroke="var(--signal)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="16" cy="16" r="2.6" fill="var(--signal)" />
    </svg>
  )
}

export function Wordmark() {
  return (
    <span className="wordmark">
      <Mark />
      <span>Kwoat</span>
      <sup>®</sup>
    </span>
  )
}

/** Two stacked copies of the text roll up on hover. */
export function Roll({ children }: { children: string }) {
  return (
    <span className="roll">
      <span>{children}</span>
      <span aria-hidden>{children}</span>
    </span>
  )
}

export const Arrow = ({ size = 12 }: { size?: number }) => (
  <svg className="ar" width={size} height={size} viewBox="0 0 12 12" aria-hidden>
    <path d="M1 6h10M7 2l4 4-4 4" stroke="currentColor" strokeWidth="1.4" fill="none" />
  </svg>
)

type BtnProps = {
  to?: string
  href?: string
  onClick?: () => void
  variant?: 'ink' | 'line' | 'signal'
  size?: 'sm' | 'md'
  children: string
  type?: 'button' | 'submit'
  disabled?: boolean
  arrow?: boolean
  className?: string
}

export function Btn({ to, href, onClick, variant = 'ink', size = 'md', children, type = 'button', disabled, arrow = true, className = '' }: BtnProps) {
  const ref = useMagnetic<HTMLElement>(0.18)
  const cls = `btn btn-${variant} ${size === 'sm' ? 'btn-sm' : ''} ${className}`
  const inner = (
    <>
      <Roll>{children}</Roll>
      {arrow && <Arrow />}
    </>
  )
  if (to)
    return (
      <Link ref={ref as never} to={to} className={cls}>
        {inner}
      </Link>
    )
  if (href)
    return (
      <a ref={ref as never} href={href} onClick={onClick} className={cls}>
        {inner}
      </a>
    )
  return (
    <button ref={ref as never} type={type} onClick={onClick} disabled={disabled} className={cls}>
      {inner}
    </button>
  )
}

export function Section({ id, index, title, children, className = '', dark = false }: { id?: string; index: string; title: string; children: ReactNode; className?: string; dark?: boolean }) {
  return (
    <section id={id} className={`sec ${dark ? 'is-dark' : ''} ${className}`}>
      <div className="sec-rail container">
        <span className="label">
          <b>§{index}</b> — {title}
        </span>
        <span className="label sec-rule" />
        <span className="label">Kwoat / {new Date().getFullYear()}</span>
      </div>
      {children}
    </section>
  )
}

export function Icon({ name, size = 16 }: { name: keyof typeof PATHS; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden>
      {PATHS[name]}
    </svg>
  )
}

const PATHS = {
  chat: <path d="M4 5h16v11H9l-5 4z" />,
  compare: <path d="M4 4h6v16H4zM14 4h6v16h-6z" />,
  image: (
    <>
      <path d="M3 4h18v16H3z" />
      <path d="m3 16 5-5 4 4 3-3 6 6" />
    </>
  ),
  rocket: <path d="M12 3c4 2 6 6 6 10l-3 3H9l-3-3c0-4 2-8 6-10zM9 16l-2 5M15 16l2 5M12 10v.01" />,
  mic: <path d="M9 3h6v11H9zM5 11a7 7 0 0 0 14 0M12 18v3" />,
  chart: <path d="M4 20V4M4 20h16M8 16v-5M12 16V8M16 16v-8M20 16v-3" />,
  plus: <path d="M12 5v14M5 12h14" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  send: <path d="M5 12h14M13 6l6 6-6 6" />,
  check: <path d="m5 12 4 4 10-10" />,
  sun: <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 1v3M12 20v3M1 12h3M20 12h3" />,
  moon: <path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z" />,
  menu: <path d="M3 7h18M3 12h18M3 17h18" />,
  download: <path d="M12 4v11M7 10l5 5 5-5M4 20h16" />,
  file: <path d="M6 3h8l4 4v14H6zM14 3v4h4" />,
  logout: <path d="M15 4h5v16h-5M10 8l-4 4 4 4M6 12h10" />,
  wallet: <path d="M3 6h18v14H3zM3 10h18M16 15h2" />,
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
} as const
