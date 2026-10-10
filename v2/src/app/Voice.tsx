import { useEffect, useRef, useState } from 'react'
import { api } from '../api'

const SCRIPT = ['Can you help me plan a weekend in Zanzibar?', 'What should I not miss in Stone Town?']
type Line = { who: 'you' | 'ai'; text: string }

/** Simulated call. The real one streams mic audio over a WebSocket. */
export default function Voice() {
  const [live, setLive] = useState(false)
  const [who, setWho] = useState<'you' | 'ai' | null>(null)
  const [lines, setLines] = useState<Line[]>([])
  const [secs, setSecs] = useState(0)
  const canvas = useRef<HTMLCanvasElement>(null)
  const whoRef = useRef(who)
  whoRef.current = who

  useEffect(() => {
    const c = canvas.current!
    const g = c.getContext('2d')!
    let raf = 0
    let level = 0
    const draw = (t: number) => {
      const w = (c.width = c.clientWidth * 2)
      const h = (c.height = c.clientHeight * 2)
      g.fillStyle = '#0e0e0c'
      g.fillRect(0, 0, w, h)
      g.strokeStyle = 'rgba(236,235,228,0.07)'
      for (let x = 0; x <= w; x += w / 12) {
        g.beginPath()
        g.moveTo(x, 0)
        g.lineTo(x, h)
        g.stroke()
      }
      for (let y = 0; y <= h; y += h / 8) {
        g.beginPath()
        g.moveTo(0, y)
        g.lineTo(w, y)
        g.stroke()
      }
      const target = whoRef.current ? 0.7 + Math.random() * 0.2 : 0.05
      level += (target - level) * 0.1
      const col = whoRef.current === 'you' ? '#c8f169' : '#ff4f1a'
      for (let k = 0; k < 3; k++) {
        g.beginPath()
        for (let x = 0; x <= w; x += 3) {
          const p = x / w
          const env = Math.sin(p * Math.PI) ** 2
          const y = h / 2 + Math.sin(p * (8 + k * 5) * Math.PI + t / (220 - k * 50)) * Math.sin(p * 2.3 + t / 700) * h * 0.36 * env * level * (1 - k * 0.28)
          if (x === 0) g.moveTo(x, y)
          else g.lineTo(x, y)
        }
        g.strokeStyle = k === 0 ? col : `rgba(236,235,228,${0.35 - k * 0.1})`
        g.lineWidth = k === 0 ? 4 : 2
        g.shadowColor = col
        g.shadowBlur = k === 0 ? 24 : 0
        g.stroke()
      }
      g.shadowBlur = 0
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    if (!live) return
    const id = setInterval(() => setSecs((s) => s + 1), 1000)
    let cancelled = false
    ;(async () => {
      for (const q of SCRIPT) {
        if (cancelled) return
        setWho('you')
        await sleep(1700)
        if (cancelled) return
        setLines((l) => [...l, { who: 'you', text: q }, { who: 'ai', text: '' }])
        setWho('ai')
        let text = ''
        await api.streamChat(q, 'gemini-2.5-flash', {
          onToken: (t) => {
            if (cancelled) return
            text += t
            setLines((l) => [...l.slice(0, -1), { who: 'ai', text }])
          },
          onDone: () => {},
        })
        setWho(null)
        await sleep(800)
      }
    })()
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [live])

  return (
    <div className="page voice">
      <div className="vx">
        <div className="vx-top label">
          <span>
            <span className={`led ${live ? 'blink' : ''}`} /> {live ? (who === 'you' ? 'Listening' : who === 'ai' ? 'Speaking' : 'Your turn') : 'Line idle'}
          </span>
          <span>{fmt(secs)}</span>
          <span>Gemini 2.5 Flash · low latency</span>
        </div>
        <canvas ref={canvas} className="vx-scope" aria-hidden />
        <div className="vx-ctl">
          <button
            className={`vx-call ${live ? 'is-live' : ''}`}
            onClick={() => {
              if (live) {
                setLive(false)
                setWho(null)
              } else {
                setLines([])
                setSecs(0)
                setLive(true)
              }
            }}
            data-cursor={live ? 'Hang up' : 'Call'}
          >
            {live ? 'End call' : 'Start call'}
          </button>
        </div>
      </div>
      <aside className="vx-tr">
        <span className="label">
          <b>Transcript</b> — saved to chat on hang-up
        </span>
        {lines.map((l, i) => (
          <p key={i} className={`vx-line ${l.who}`}>
            <span className="label">{l.who === 'you' ? 'You' : 'Kwoat'}</span>
            {l.text}
          </p>
        ))}
      </aside>
    </div>
  )
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
