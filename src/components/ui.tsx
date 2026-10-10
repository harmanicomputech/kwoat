import { forwardRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useMagnetic } from '../lib/hooks'

export function Logo({ size = 28, withWord = true }: { size?: number; withWord?: boolean }) {
  return (
    <span className="logo">
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c4b5fd" />
            <stop offset="0.6" stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#e879f9" />
          </linearGradient>
        </defs>
        <path
          className="logo-strokes"
          d="M10 10l14 44M20 10l11 34M32 8v38M44 10l-11 34M54 10L40 54"
          stroke="url(#lg)"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      {withWord && <span className="logo-word">Kwoat</span>}
    </span>
  )
}

type MagneticProps = {
  to?: string
  href?: string
  onClick?: () => void
  className?: string
  children: ReactNode
  strength?: number
  label?: string
  type?: 'button' | 'submit'
  disabled?: boolean
}

/** Button or link that is pulled toward the cursor, with an inner layer that moves further. */
export function Magnetic({ to, href, onClick, className = 'btn btn-primary', children, strength = 0.3, label, type = 'button', disabled }: MagneticProps) {
  const ref = useMagnetic<HTMLElement>(strength)
  const inner = <span className="btn-inner">{children}</span>
  const common = { className, 'data-cursor': 'hover', 'aria-label': label }
  if (to)
    return (
      <Link ref={ref as never} to={to} {...common}>
        {inner}
      </Link>
    )
  if (href)
    return (
      <a ref={ref as never} href={href} onClick={onClick} {...common}>
        {inner}
      </a>
    )
  return (
    <button ref={ref as never} type={type} onClick={onClick} disabled={disabled} {...common}>
      {inner}
    </button>
  )
}

export const Arrow = () => (
  <svg className="arrow" width="16" height="16" viewBox="0 0 16 16" aria-hidden>
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const Icon = forwardRef<SVGSVGElement, { name: IconName; size?: number }>(function Icon({ name, size = 18 }, ref) {
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {ICONS[name]}
    </svg>
  )
})

export type IconName = keyof typeof ICONS

const ICONS = {
  plus: <path d="M12 5v14M5 12h14" />,
  chat: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />,
  compare: (
    <>
      <rect x="3" y="4" width="7" height="16" rx="2" />
      <rect x="14" y="4" width="7" height="16" rx="2" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-5-5L5 21" />
    </>
  ),
  rocket: (
    <>
      <path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2" />
      <path d="M9 12a12 12 0 0 1 11-9 12 12 0 0 1-9 11l-2 1-2-2 1-1Z" />
      <circle cx="15" cy="9" r="1.5" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </>
  ),
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  wallet: (
    <>
      <rect x="3" y="6" width="18" height="14" rx="3" />
      <path d="M3 10h18M16 15h2" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  send: <path d="M5 12h14M13 6l6 6-6 6" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10Z" />,
  check: <path d="m5 12 5 5 9-10" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  sparkle: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />,
  file: (
    <>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" />
      <path d="M14 3v6h6" />
    </>
  ),
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7Z" />,
  download: <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  logout: <path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />,
  wave: <path d="M3 12h2M7 8v8M11 5v14M15 8v8M19 10v4M21 12h0" />,
} as const
