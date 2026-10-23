import { useTheme } from '../lib/store'

/** Sun/moon switch; the new theme spreads out in a circle from the click. */
export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button className={`theme-toggle ${theme === 'dark' ? 'is-dark' : ''}`} onClick={(e) => toggle(e)} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} data-cursor="hover">
      <span className="tt-track">
        <span className="tt-thumb">
          <svg className="tt-sun" viewBox="0 0 24 24" width="14" height="14" aria-hidden>
            <circle cx="12" cy="12" r="4.5" fill="currentColor" />
            {Array.from({ length: 8 }).map((_, i) => (
              <line key={i} x1="12" y1="2" x2="12" y2="4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" transform={`rotate(${i * 45} 12 12)`} />
            ))}
          </svg>
          <svg className="tt-moon" viewBox="0 0 24 24" width="14" height="14" aria-hidden>
            <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" fill="currentColor" />
          </svg>
        </span>
        <i className="tt-star s1" />
        <i className="tt-star s2" />
        <i className="tt-star s3" />
      </span>
    </button>
  )
}
