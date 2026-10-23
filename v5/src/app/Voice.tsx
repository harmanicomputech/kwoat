import { useEffect, useRef, useState } from 'react'
import { Icon } from '../components/ui'
import { api } from '../api'

const SCRIPT = [
  'Can you help me plan a weekend in Zanzibar?',
  'What should I definitely not miss in Stone Town?',
]

type Line = { who: 'you' | 'ai'; text: string }

/** Simulated live call. The real version would stream mic audio over a WebSocket. */
export default function Voice() {
  const [live, setLive] = useState(false)
  const [speaking, setSpeaking] = useState<'you' | 'ai' | null>(null)
  const [lines, setLines] = useState<Line[]>([])
  const [secs, setSecs] = useState(0)
  const canvas = useRef<HTMLCanvasElement>(null)
  const level = useRef(0)
  const speakingRef = useRef(speaking)
  speakingRef.current = speaking

  // Orb visualiser
  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const g = c.getContext('2d')!
    let raf = 0
    const draw = (t: number) => {
      const s = c.clientWidth * 2
      c.width = c.height = s
      const target = speakingRef.current ? 0.6 + Math.sin(t / 90) * 0.25 + Math.random() * 0.15 : 0.08
      level.current += (target - level.current) * 0.12
      g.clearRect(0, 0, s, s)
      const cx = s / 2
      const base = s * 0.26
      for (let k = 0; k < 3; k++) {
        g.beginPath()
        for (let a = 0; a <= Math.PI * 2 + 0.01; a += Math.PI / 90) {
          const n = Math.sin(a * (3 + k) + t / (400 - k * 80)) * Math.cos(a * 2 - t / 600)
          const r = base + k * 14 + n * level.current * s * 0.06
          const x = cx + Math.cos(a) * r
          const y = cx + Math.sin(a) * r
          if (a === 0) g.moveTo(x, y)
          else g.lineTo(x, y)
        }
        g.closePath()
        g.strokeStyle = speakingRef.current === 'you' ? `rgba(103,232,249,${0.7 - k * 0.2})` : `rgba(196,181,253,${0.8 - k * 0.22})`
        g.lineWidth = 3
        g.stroke()
      }
      const grd = g.createRadialGradient(cx, cx, 0, cx, cx, base)
      grd.addColorStop(0, speakingRef.current === 'you' ? '#a5f3fc' : '#f5d0fe')
      grd.addColorStop(0.6, '#8b5cf6')
      grd.addColorStop(1, '#2e1065')
      g.fillStyle = grd
      g.beginPath()
      g.arc(cx, cx, base * (0.92 + level.current * 0.12), 0, Math.PI * 2)
      g.fill()
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    if (!live) return
    const id = setInterval(() => setSecs((s) => s + 1), 1000)
    let cancelled = false
    const run = async () => {
      for (const q of SCRIPT) {
        if (cancelled) return
        setSpeaking('you')
        await sleep(1800)
        setLines((l) => [...l, { who: 'you', text: q }])
        setSpeaking('ai')
        let text = ''
        setLines((l) => [...l, { who: 'ai', text: '' }])
        await api.streamChat(q, 'gemini-2.5-flash', {
          onToken: (t) => {
            text += t
            setLines((l) => [...l.slice(0, -1), { who: 'ai', text }])
          },
          onDone: () => {},
        })
        setSpeaking(null)
        await sleep(900)
      }
    }
    run()
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [live])

  return (
    <div className="page voice">
      <div className="vc-stage">
        <canvas ref={canvas} className="vc-orb" aria-hidden />
        <div className="vc-state">{!live ? 'Tap to start a live call' : speaking === 'you' ? 'Listening…' : speaking === 'ai' ? 'Speaking…' : 'Your turn'}</div>
        {live && <div className="vc-timer">{fmt(secs)}</div>}
        <div className="vc-controls">
          {!live ? (
            <button
              className="vc-call"
              onClick={() => {
                setLines([])
                setSecs(0)
                setLive(true)
              }}
              data-cursor="hover"
            >
              <Icon name="mic" size={26} />
            </button>
          ) : (
            <button
              className="vc-call end"
              onClick={() => {
                setLive(false)
                setSpeaking(null)
              }}
              data-cursor="hover"
            >
              <Icon name="x" size={26} />
            </button>
          )}
        </div>
      </div>
      <aside className="vc-transcript card">
        <h4>Transcript</h4>
        {lines.length === 0 && <p className="vc-empty">The conversation will appear here and be saved to your chat when you hang up.</p>}
        {lines.map((l, i) => (
          <p key={i} className={`vc-line ${l.who}`}>
            <b>{l.who === 'you' ? 'You' : 'Kwoat'}</b> {l.text}
          </p>
        ))}
      </aside>
    </div>
  )
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
