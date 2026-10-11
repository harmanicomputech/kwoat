import { useEffect, useRef, useState } from 'react'
import { gsap, SplitText } from '../lib/motion'
import { Icon, Mark, Magnetic } from '../components/ui'
import { useInView } from '../lib/hooks'

// Replace these with the real store listings when the apps are published.
export const APP_STORE_URL = '#app-store'
export const PLAY_STORE_URL = '#google-play'

const CHAT = [
  { q: 'Plan a 3-day trip to Zanzibar', m: 'Gemini 2.5 Flash', a: 'Day 1: Stone Town walking tour and sunset at Forodhani. Day 2: Nungwi beaches and a dhow cruise. Day 3: spice farm, then Jozani forest.' },
  { q: 'Fix this SQL — it returns duplicates', m: 'GPT-5.4', a: 'You’re joining orders twice. Add DISTINCT on order_id, or move the second join into a subquery that groups by customer.' },
  { q: 'Write a caption for my bakery post', m: 'Claude Sonnet 4.6', a: 'Fresh out of the oven and gone by noon 🥐 Our butter croissants are back — come early, bring a friend.' },
]
const PUSHES = [
  { t: 'Mission complete', d: '14 files ready to download', c: '#16a34a', i: 'rocket' as const },
  { t: 'Image ready', d: '“Neon fox in a rainy alley” · 4 variations', c: '#db2777', i: 'image' as const },
  { t: 'Routed to Claude Sonnet 4.6', d: 'Landing page · 6 credits', c: '#7c3aed', i: 'bolt' as const },
]
const ORBIT: { i: 'mic' | 'image' | 'bolt' | 'chat' | 'rocket' | 'wallet'; c: string }[] = [
  { i: 'mic', c: '#7c3aed' },
  { i: 'image', c: '#db2777' },
  { i: 'bolt', c: '#f59e0b' },
  { i: 'chat', c: '#0891b2' },
  { i: 'rocket', c: '#16a34a' },
  { i: 'wallet', c: '#6366f1' },
]

/* ---------- phone screens ---------- */

function ChatScreen({ live }: { live: boolean }) {
  const [n, setN] = useState(0)
  const [stage, setStage] = useState<'q' | 'route' | 'a' | 'hold'>('q')
  const [typed, setTyped] = useState('')
  const c = CHAT[n % CHAT.length]

  useEffect(() => {
    if (!live) return
    let t: ReturnType<typeof setTimeout>
    if (stage === 'q') t = setTimeout(() => setStage('route'), 900)
    else if (stage === 'route') t = setTimeout(() => setStage('a'), 1100)
    else if (stage === 'a') {
      if (typed.length < c.a.length) t = setTimeout(() => setTyped(c.a.slice(0, typed.length + 3)), 28)
      else t = setTimeout(() => setStage('hold'), 2200)
    } else
      t = setTimeout(() => {
        setN((x) => x + 1)
        setTyped('')
        setStage('q')
      }, 300)
    return () => clearTimeout(t)
  }, [live, stage, typed, c.a])

  return (
    <div className="ps-chat">
      <div className="ps-head">
        <span className="ps-brand">
          <Mark size={14} /> Kwoat
        </span>
        <span className="ps-cred">5,495 cr</span>
      </div>
      <div className="ps-thread" key={n}>
        <div className="ps-q">{c.q}</div>
        {stage !== 'q' && (
          <div className={`ps-route ${stage === 'route' ? 'is-busy' : ''}`}>
            {stage === 'route' ? <span className="spinner" /> : <Icon name="check" size={11} />}
            {stage === 'route' ? 'Choosing the best model…' : `Routed to ${c.m}`}
          </div>
        )}
        {(stage === 'a' || stage === 'hold') && (
          <div className="ps-a">
            {typed}
            {stage === 'a' && <span className="caret" />}
          </div>
        )}
      </div>
      <div className="ps-composer">
        <span>Ask anything…</span>
        <span className="ps-mic">
          <Icon name="mic" size={13} />
          <i className="ps-tap" aria-hidden />
        </span>
      </div>
    </div>
  )
}

function VoiceScreen() {
  return (
    <div className="ps-voice">
      <div className="ps-head">
        <span className="ps-brand">
          <Mark size={14} /> Voice live
        </span>
        <span className="ps-rec">
          <i /> 01:24
        </span>
      </div>
      <div className="ps-orb">
        <span />
        <span />
        <span />
        <b />
      </div>
      <p className="ps-listen">Listening…</p>
      <div className="ps-wave" aria-hidden>
        {Array.from({ length: 22 }).map((_, i) => (
          <i key={i} style={{ animationDelay: `${(i * 73) % 900}ms` }} />
        ))}
      </div>
      <p className="ps-said">“…and book somewhere near the beach.”</p>
      <div className="ps-end">
        <Icon name="x" size={18} />
      </div>
    </div>
  )
}

/* ---------- store buttons (styled for this site, not the official badge artwork) ---------- */

function StoreButtons() {
  return (
    <div className="store-btns">
      <Magnetic href={APP_STORE_URL} className="store-btn" strength={0.2} label="Download on the App Store">
        <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden>
          <path
            fill="currentColor"
            d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.8 1.2 1.8 2.6 3.1 2.5 1.3-.1 1.7-.8 3.3-.8 1.5 0 2 .8 3.3.8 1.4 0 2.3-1.2 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9-.1 0-2.7-1-2.5-4ZM13.9 5c.7-.8 1.2-2 1-3.1-1 .1-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4Z"
          />
        </svg>
        <span>
          <small>Download on the</small>
          <b>App Store</b>
        </span>
      </Magnetic>
      <Magnetic href={PLAY_STORE_URL} className="store-btn" strength={0.2} label="Get it on Google Play">
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
          <path fill="#34d399" d="M3.6 2.3 13.4 12l-9.8 9.7c-.4-.2-.6-.6-.6-1.1V3.4c0-.5.2-.9.6-1.1Z" />
          <path fill="#60a5fa" d="m16.6 15.2-3.2-3.2 3.2-3.2 3.9 2.2c1.1.6 1.1 1.5 0 2.1l-3.9 2.1Z" />
          <path fill="#fbbf24" d="M16.6 8.8 13.4 12 3.6 2.3c.3-.2.8-.2 1.3.1l11.7 6.4Z" />
          <path fill="#f472b6" d="M16.6 15.2 4.9 21.6c-.5.3-1 .3-1.3.1l9.8-9.7 3.2 3.2Z" />
        </svg>
        <span>
          <small>Get it on</small>
          <b>Google Play</b>
        </span>
      </Magnetic>
    </div>
  )
}

/* ---------- section ---------- */

export function AppDownload() {
  const root = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.25 })
  const [push, setPush] = useState(0)

  // Notifications drop in one after another while the section is on screen
  useEffect(() => {
    if (!inView) return
    const id = setInterval(() => setPush((p) => p + 1), 2800)
    return () => clearInterval(id)
  }, [inView])

  // Entrance + scroll parallax
  useEffect(() => {
    const mm = gsap.matchMedia()
    const ctx = gsap.context(() => {
      const split = SplitText.create('.ad-title', { type: 'words', wordsClass: 'w', mask: 'words' })
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 70%' }, defaults: { ease: 'kwoat' } })
      tl.from('.ad-icon', { scale: 0, rotate: -40, duration: 1.2, ease: 'back.out(1.8)' })
        .from('.ad-kicker', { y: 16, opacity: 0, duration: 0.9 }, 0.15)
        .from(split.words, { yPercent: 110, duration: 1.2, stagger: 0.05 }, 0.1)
        .from('.ad-lede', { y: 16, opacity: 0, filter: 'blur(6px)', duration: 1 }, 0.35)
        .from('.store-btn', { y: 24, opacity: 0, scale: 0.9, duration: 1, stagger: 0.1 }, 0.5)
        .from('.ad-orbit span', { scale: 0, opacity: 0, duration: 0.8, stagger: 0.08, ease: 'back.out(2)' }, 1)
        .from('.phone-a', { y: 220, rotate: -14, opacity: 0, duration: 1.6 }, 0.2)
        .from('.phone-b', { y: 260, rotate: 18, opacity: 0, duration: 1.6 }, 0.35)
        .from('.ad-chip', { scale: 0, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'back.out(1.8)' }, 0.9)
      mm.add('(min-width: 900px)', () => {
        gsap.to('.phone-a', { y: -70, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
        gsap.to('.phone-b', { y: -150, rotate: 10, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
        gsap.to('.ad-rings', { rotate: 90, scale: 1.15, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
      })
    }, root)
    return () => {
      ctx.revert()
      mm.revert()
    }
  }, [])

  // 3D tilt of the phone group toward the pointer
  useEffect(() => {
    const el = stage.current
    if (!el || window.matchMedia('(hover: none)').matches) return
    const rx = gsap.quickTo(el, 'rotateX', { duration: 0.9, ease: 'power3' })
    const ry = gsap.quickTo(el, 'rotateY', { duration: 0.9, ease: 'power3' })
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const x = (e.clientX - (r.left + r.width / 2)) / window.innerWidth
      const y = (e.clientY - (r.top + r.height / 2)) / window.innerHeight
      ry(x * 22)
      rx(-y * 14)
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])

  const p = PUSHES[push % PUSHES.length]

  return (
    <section ref={root} className="app-dl" id="app">
      <div className="ad-bg" aria-hidden>
        <div className="ad-blob" />
        <div className="ad-rings">
          <i />
          <i />
          <i />
        </div>
      </div>
      <div className="container ad-grid">
        <div className="ad-copy">
          <div className="ad-icon" aria-hidden>
            <Mark size={38} />
            <i />
          </div>
          <span className="eyebrow ad-kicker">iPhone &amp; Android</span>
          <h2 className="ad-title display">
            Every AI model, <span className="grad-text">in your pocket.</span>
          </h2>
          <p className="ad-lede">Same models. Same wallet. Anywhere.</p>
          <StoreButtons />
        </div>

        <div ref={ref} className="ad-visual">
          <div ref={stage} className="ad-stage">
            {/* Android-style phone, behind */}
            <div className="phone phone-b">
              <div className="phone-body android">
                <span className="punch" />
                <div className="phone-screen">
                  <i className="ps-glare" aria-hidden />
                  <div className="ps-status">
                    <span>9:41</span>
                    <span className="ps-sig">
                      <i />
                      <i />
                      <i />
                    </span>
                  </div>
                  <VoiceScreen />
                </div>
              </div>
            </div>
            {/* iPhone-style phone, front */}
            <div className="phone phone-a">
              <div className="phone-body ios">
                <span className="island" />
                <div className="phone-screen">
                  <i className="ps-glare" aria-hidden />
                  <div className="ps-status">
                    <span>9:41</span>
                    <span className="ps-sig">
                      <i />
                      <i />
                      <i />
                    </span>
                  </div>
                  <div className="ps-push" key={push}>
                    <span className="ps-push-ic" style={{ background: p.c }}>
                      <Icon name={p.i} size={13} />
                    </span>
                    <span>
                      <b>{p.t}</b>
                      <small>{p.d}</small>
                    </span>
                    <em>now</em>
                  </div>
                  <ChatScreen live={inView} />
                </div>
              </div>
            </div>

            <div className="ad-orbit" aria-hidden>
              {ORBIT.map((o, i) => (
                <span key={o.i} style={{ ['--k' as string]: i, ['--c' as string]: o.c }}>
                  <b>
                    <Icon name={o.i} size={16} />
                  </b>
                </span>
              ))}
            </div>
            <span className="ad-chip c1">
              <Icon name="mic" size={14} /> Talk, don’t type
            </span>
            <span className="ad-chip c2">
              <Icon name="bolt" size={14} /> 0.4s routing
            </span>
            <span className="ad-chip c3">
              <Icon name="check" size={14} /> Syncs with web
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
