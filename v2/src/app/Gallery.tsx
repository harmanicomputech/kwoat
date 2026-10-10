import { useEffect, useRef, useState } from 'react'
import { gsap, Flip } from '../lib/motion'
import { Btn, Icon } from '../components/ui'
import { api, modelById, type GalleryImage } from '../api'

export default function Gallery() {
  const [imgs, setImgs] = useState<GalleryImage[]>([])
  const [prompt, setPrompt] = useState('')
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState<GalleryImage | null>(null)
  const grid = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.listImages().then((l) => {
      setImgs(l)
      requestAnimationFrame(() => {
        if (grid.current)
          gsap.fromTo(grid.current.querySelectorAll('.frame'), { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.3, ease: 'expo.inOut', stagger: 0.06 })
      })
    })
  }, [])

  const generate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || busy) return
    setBusy(true)
    const img = await api.generateImage(prompt)
    const state = Flip.getState('.frame')
    setImgs((l) => [img, ...l])
    setPrompt('')
    setBusy(false)
    requestAnimationFrame(() =>
      Flip.from(state, {
        duration: 0.9,
        ease: 'kwoat',
        onEnter: (els) => gsap.fromTo(els, { clipPath: 'inset(50% 50% 50% 50%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'expo.out' }),
      }),
    )
  }

  return (
    <div className="page">
      <header className="pg-head">
        <h1 className="display">
          Contact sheet.
          <br />
          <em>Every frame kept.</em>
        </h1>
        <p>FLUX.2 Klein and Nano Banana 2. Everything you generate is filed here automatically.</p>
      </header>
      <form className="gen" onSubmit={generate}>
        <span className="label">Expose</span>
        <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe a picture…" aria-label="Image prompt" />
        <Btn type="submit" variant="signal" size="sm" disabled={busy || !prompt.trim()}>
          {busy ? 'Developing…' : 'Generate'}
        </Btn>
        {busy && <i className="gen-bar" />}
      </form>
      <div ref={grid} className="sheet">
        {busy && (
          <div className="frame is-dev">
            <div className="frame-art" style={{ ['--h' as string]: 20 }} />
            <span className="label">Developing</span>
          </div>
        )}
        {imgs.map((img, i) => (
          <button key={img.id} data-flip-id={img.id} className="frame" onClick={() => setOpen(img)} data-cursor="View">
            <div className="frame-art" style={{ ['--h' as string]: img.hue }} />
            <div className="frame-dots" />
            <span className="frame-no label">
              <b>{String(imgs.length - i).padStart(3, '0')}</b>A
            </span>
            <span className="frame-cap">{img.prompt}</span>
          </button>
        ))}
      </div>
      {open && <Lightbox img={open} onClose={() => setOpen(null)} />}
    </div>
  )
}

function Lightbox({ img, onClose }: { img: GalleryImage; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.lb-bg', { opacity: 0, duration: 0.4 })
      gsap.from('.lb-card', { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'expo.inOut' })
    }, ref)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => {
      ctx.revert()
      window.removeEventListener('keydown', esc)
    }
  }, [onClose])
  return (
    <div ref={ref} className="lb" role="dialog" aria-modal="true" aria-label={img.prompt}>
      <div className="lb-bg" onClick={onClose} />
      <div className="lb-card">
        <div className="lb-img">
          <div className="frame-art" style={{ ['--h' as string]: img.hue }} />
          <div className="frame-dots" />
        </div>
        <div className="lb-side">
          <span className="label">
            <b>{modelById(img.modelId)?.name}</b> · {new Date(img.createdAt).toLocaleDateString()}
          </span>
          <p className="display">{img.prompt}</p>
          <div className="lb-act">
            <Btn size="sm">Variations</Btn>
            <Btn size="sm" variant="line">
              Download
            </Btn>
          </div>
        </div>
        <button className="lb-x" onClick={onClose} aria-label="Close">
          <Icon name="x" />
        </button>
      </div>
    </div>
  )
}
