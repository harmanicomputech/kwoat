import { useEffect, useRef, useState } from 'react'
import { gsap, Flip } from '../lib/motion'
import { Icon } from '../components/ui'
import { api, modelById, type GalleryImage } from '../api'

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [prompt, setPrompt] = useState('')
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState<GalleryImage | null>(null)
  const grid = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.listImages().then((list) => {
      setImages(list)
      requestAnimationFrame(() => {
        if (!grid.current) return
        gsap.fromTo(
          grid.current.querySelectorAll('.gl-item'),
          { clipPath: 'inset(100% 0 0 0)', y: 40 },
          { clipPath: 'inset(0% 0 0 0)', y: 0, stagger: { each: 0.06, from: 'start' }, duration: 1.1, ease: 'expo.out' },
        )
      })
    })
  }, [])

  const generate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || busy) return
    setBusy(true)
    const img = await api.generateImage(prompt)
    const state = Flip.getState('.gl-item')
    setImages((list) => [img, ...list])
    setPrompt('')
    setBusy(false)
    requestAnimationFrame(() =>
      Flip.from(state, {
        duration: 0.8,
        ease: 'kwoat',
        onEnter: (els) => gsap.fromTo(els, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.9, ease: 'back.out(1.6)' }),
      }),
    )
  }

  return (
    <div className="page gallery">
      <header className="page-head">
        <div>
          <span className="eyebrow">Gallery</span>
          <h1>Generate, vary, keep everything.</h1>
          <p>FLUX.2 Klein and Nano Banana 2. Every image is saved here automatically.</p>
        </div>
      </header>

      <form className="gl-form card" onSubmit={generate}>
        <Icon name="sparkle" />
        <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe an image…" aria-label="Image prompt" />
        <button className="btn btn-primary btn-sm" disabled={busy || !prompt.trim()}>
          {busy ? <span className="spinner" /> : 'Generate'}
        </button>
        {busy && <div className="gl-progress" />}
      </form>

      <div ref={grid} className="gl-grid">
        {busy && (
          <div className="gl-item gl-pending">
            <div className="gl-noise" />
            <span>Diffusing…</span>
          </div>
        )}
        {images.map((img, i) => (
          <button
            key={img.id}
            data-flip-id={img.id}
            className="gl-item"
            style={{ ['--h' as string]: img.hue, ['--r' as string]: i % 5 === 0 ? 'span 2' : 'span 1' }}
            onClick={() => setOpen(img)}
            data-cursor-label="View"
          >
            <div className="gl-art" />
            <div className="gl-cap">
              <p>{img.prompt}</p>
              <small>{modelById(img.modelId)?.name}</small>
            </div>
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
      gsap.from('.lb-card', { scale: 0.85, y: 40, opacity: 0, duration: 0.7, ease: 'kwoat' })
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
      <div className="lb-card card">
        <div className="lb-art gl-item" style={{ ['--h' as string]: img.hue }}>
          <div className="gl-art" />
        </div>
        <div className="lb-side">
          <p>{img.prompt}</p>
          <small>{modelById(img.modelId)?.name} · {new Date(img.createdAt).toLocaleDateString()}</small>
          <div className="lb-actions">
            <button className="btn btn-primary btn-sm">
              <Icon name="sparkle" size={16} /> Variations
            </button>
            <button className="btn btn-ghost btn-sm">
              <Icon name="download" size={16} /> Download
            </button>
          </div>
        </div>
        <button className="icon-btn lb-close" onClick={onClose} aria-label="Close">
          <Icon name="x" />
        </button>
      </div>
    </div>
  )
}
