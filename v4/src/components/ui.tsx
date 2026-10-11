import { forwardRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useMagnetic } from '../lib/hooks'

/** The Kwoat mark: five rays converging on one point. */
export function Mark({ size = 22, color = 'currentColor', className = '' }: { size?: number; color?: string; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" aria-hidden className={`mark ${className}`}>
      <g fill={color}>
        <path className="ray" d="M 12 18 L 18 14 L 48 84 Z" />
        <path className="ray" d="M 28 12 L 33 10 L 48 84 Z" />
        <path className="ray" d="M 46 22 L 50 22 L 48 84 Z" />
        <path className="ray" d="M 63 10 L 68 12 L 48 84 Z" />
        <path className="ray" d="M 78 14 L 84 18 L 48 84 Z" />
      </g>
    </svg>
  )
}

export function Logo({ size = 22, withWord = true }: { size?: number; withWord?: boolean }) {
  return (
    <span className="logo">
      <Mark size={size} />
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
export function Magnetic({ to, href, onClick, className = 'btn btn-primary', children, strength = 0.12, label, type = 'button', disabled }: MagneticProps) {
  const ref = useMagnetic<HTMLElement>(strength)
  const inner = <>{children}</>
  const common = { className, 'aria-label': label }
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
  <svg className="arrow" width="14" height="14" viewBox="0 0 16 16" aria-hidden>
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const Icon = forwardRef<SVGSVGElement, { name: IconName; size?: number }>(function Icon({ name, size = 18 }, ref) {
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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
  pencil: <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4ZM13.5 6.5l4 4" />,
  code: <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" />,
  analyse: (
    <>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" />
      <path d="M14 3v6h6v2" />
      <circle cx="16.5" cy="16.5" r="3.5" />
      <path d="m19 19 2 2" />
    </>
  ),
  branches: (
    <>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M6 8.5V13a5 5 0 0 0 5 5h4.5M18 15.5V11a5 5 0 0 0-5-5H8.5" />
    </>
  ),
  doc: (
    <>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" />
      <path d="M14 3v6h6M8 13h8M8 17h5" />
    </>
  ),
  crown: <path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5L3 8Z" />,
  dots: <path d="M5 12h.01M12 12h.01M19 12h.01" />,
  chevron: <path d="m9 6 6 6-6 6" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  sidebar: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M9 4v16" />
    </>
  ),
  alert: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5M12 16.5h.01" />
    </>
  ),
  folder: <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </>
  ),
  layers: <path d="m12 3 9 5-9 5-9-5 9-5ZM3 13l9 5 9-5M3 17.5l9 5 9-5" />,
  copy: (
    <>
      <rect x="8" y="8" width="12" height="12" rx="2.5" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </>
  ),
  refresh: <path d="M20 11a8 8 0 0 0-14.5-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.5 4.5L20 16M20 20v-4h-4" />,
  thumb: <path d="M7 11v9H4v-9h3Zm0 0 4-8a2.5 2.5 0 0 1 2.5 2.5V9h5a2 2 0 0 1 2 2.3l-1.2 7A2 2 0 0 1 17.3 20H7" />,
  clip: <path d="m20 11-8 8a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7L9.7 16.7a1.7 1.7 0 0 1-2.4-2.4L15 6.6" />,
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3 10h18M7 15h4" />
    </>
  ),
  arrowUp: <path d="M12 19V5M6 11l6-6 6 6" />,
  arrowDown: <path d="M12 5v14M6 13l6 6 6-6" />,
  bubbles: (
    <>
      <path d="M16 10a6 6 0 0 1-8.7 5.4L4 16l.7-3A6 6 0 1 1 16 10Z" />
      <path d="M18.5 9.5A5 5 0 0 1 20 17l.5 2.5-2.7-.6A5 5 0 0 1 11 18" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7.4 19.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.5 14H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 7.4l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 3.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.6 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.6H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" />
    </>
  ),
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />,
  history: <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 3" />,
} as const
