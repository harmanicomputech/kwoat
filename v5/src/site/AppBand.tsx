import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from '../lib/motion'
import { Icon, Mark } from '../components/ui'

// Store links are placeholders until the apps are published.
export const APP_STORE_URL = '#app-store'
export const PLAY_STORE_URL = '#google-play'

const CHAT = [
  { me: true, t: 'Summarise my meeting notes' },
  { me: false, t: 'Here are the 5 key decisions and 3 action items…', m: 'Claude Sonnet 4.6' },
  { me: true, t: 'Make a poster for the launch' },
  { me: false, t: 'Done — 4 options saved to your Gallery.', m: 'FLUX.2 Klein', img: true },
]

export function AppBand() {
  const root = useRef<HTMLElement>(null)
  const [n, setN] = useState(1)

  useEffect(() => {
    const t = setInterval(() => setN((x) => (x >= CHAT.length ? 1 : x + 1)), 1800)
    return () => clearInterval(t)
  }, [])

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.ap5-phone.a', { yPercent: 18 }, { yPercent: -8, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
      gsap.fromTo('.ap5-phone.b', { yPercent: 30 }, { yPercent: -18, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="ap5 sec5" id="app">
      <div className="container">
        <div className="ap5-card" data-reveal>
          <span className="ap5-grid" aria-hidden />
          <div className="ap5-copy">
            <span className="kick5">
              <Icon name="sparkle" size={14} /> iPhone &amp; Android
            </span>
            <h2 data-split>Kwoat in your pocket.</h2>
            <p>Same models, same wallet, same chats — synced everywhere you are.</p>
            <div className="ap5-stores">
              <a href={APP_STORE_URL} className="ap5-store">
                <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
                  <path fill="currentColor" d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.2-2.8.8-3.5.8s-1.8-.8-3-.8C7 7.4 5.6 8.3 4.8 9.7c-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2-1.1 2.8-2.3.9-1.3 1.2-2.5 1.3-2.6-.1 0-2.6-1-2.6-3.8ZM14.2 5.8c.6-.8 1.1-1.8 1-2.8-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.7-1 2.7 1 .1 2-.5 2.7-1.3Z" />
                </svg>
                <span>
                  <small>Download on the</small>
                  <b>App Store</b>
                </span>
              </a>
              <a href={PLAY_STORE_URL} className="ap5-store">
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
                  <path fill="#34d399" d="M3.6 2.3 13.4 12l-9.8 9.7c-.4-.2-.6-.7-.6-1.2V3.5c0-.5.2-1 .6-1.2Z" />
                  <path fill="#60a5fa" d="m16.6 15.2-3.2-3.2 3.2-3.2 3.7 2.1c1 .6 1 1.6 0 2.2l-3.7 2.1Z" />
                  <path fill="#f87171" d="M13.4 12 3.6 21.7c.4.2.9.2 1.4-.1l11.6-6.4-3.2-3.2Z" />
                  <path fill="#fbbf24" d="M13.4 12 16.6 8.8 5 2.4c-.5-.3-1-.3-1.4-.1L13.4 12Z" />
                </svg>
                <span>
                  <small>Get it on</small>
                  <b>Google Play</b>
                </span>
              </a>
            </div>
          </div>
          <div className="ap5-phones" aria-hidden>
            <div className="ap5-phone b">
              <div className="ap5-screen voice">
                <span className="ap5-orb">
                  <i />
                  <Mark size={20} color="#fff" />
                </span>
                <div className="ap5-wave">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <i key={i} style={{ animationDelay: `${(i % 5) * -0.17}s` }} />
                  ))}
                </div>
                <small>Listening…</small>
              </div>
            </div>
            <div className="ap5-phone a">
              <div className="ap5-screen">
                <div className="ap5-top">
                  <Mark size={14} /> Kwoat <span>Auto</span>
                </div>
                <div className="ap5-chat">
                  {CHAT.slice(0, n).map((c, i) => (
                    <div key={i + '-' + n} className={`ap5-msg ${c.me ? 'me' : 'bot'}`}>
                      {c.m && <small>{c.m}</small>}
                      {c.img && <span className="ap5-img" />}
                      {c.t}
                    </div>
                  ))}
                </div>
                <div className="ap5-input">
                  Ask anything… <span>
                    <Icon name="mic" size={12} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
