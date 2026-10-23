import { useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap, Flip } from '../lib/motion'
import { Icon } from '../components/ui'
import { MODELS, modelById, type GalleryImage } from '../api'
import { Art, Empty, Modal, timeAgo, usePageIn, useDismiss, usePop } from './kit'
import { useWorkspace } from './workspace'

const TIMES = [
  { id: 'all', label: 'All time', ms: Infinity },
  { id: '1', label: 'Today', ms: 864e5 },
  { id: '7', label: 'Last 7 days', ms: 7 * 864e5 },
  { id: '30', label: 'Last 30 days', ms: 30 * 864e5 },
]

export default function Gallery() {
  const ws = useWorkspace()
  const navigate = useNavigate()
  const root = usePageIn<HTMLDivElement>()
  const grid = useRef<HTMLDivElement>(null)
  const [model, setModel] = useState('all')
  const [time, setTime] = useState('all')
  const [spin, setSpin] = useState(0)
  const [open, setOpen] = useState<GalleryImage | null>(null)
  const imageModels = MODELS.filter((m) => m.strengths.includes('images'))
  const t = TIMES.find((x) => x.id === time)!
  const list = ws.images.filter((i) => (model === 'all' || i.modelId === model) && Date.now() - i.createdAt < t.ms)

  // Filtering re-flows the grid with Flip
  const flip = useRef<Flip.FlipState | null>(null)
  const capture = () => {
    if (grid.current) flip.current = Flip.getState(grid.current.children)
  }
  useLayoutEffect(() => {
    if (!flip.current) return
    Flip.from(flip.current, { duration: 0.6, ease: 'kwoat', scale: true, absolute: true, onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.5 }), onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.8, duration: 0.4 }) })
    flip.current = null
  }, [model, time])

  return (
    <div ref={root} className="kp gl">
      <header className="gl-head reveal">
        <div className="gl-title">
          <h1>My Gallery</h1>
          <span className="k-badge">{list.length} {list.length === 1 ? "image" : "images"}</span>
        </div>
        <div className="gl-filters">
          <Select
            value={model}
            onChange={(v) => (capture(), setModel(v))}
            options={[{ id: 'all', label: 'All models' }, ...imageModels.map((m) => ({ id: m.id, label: m.name }))]}
          />
          <Select value={time} onChange={(v) => (capture(), setTime(v))} options={TIMES} />
          <button className="k-iconbtn" aria-label="Refresh" onClick={() => setSpin((s) => s + 1)}>
            <span style={{ transform: `rotate(${spin * 360}deg)` }}>
              <Icon name="refresh" size={17} />
            </span>
          </button>
        </div>
      </header>

      {list.length ? (
        <div ref={grid} className="gl-grid">
          {list.map((img, i) => (
            <button key={img.id} className={`gl-tile ${i % 5 === 0 ? 'tall' : ''}`} onClick={() => setOpen(img)}>
              <Art hue={img.hue} />
              <span className="gl-cap">
                <b>{img.prompt}</b>
                <small>
                  {modelById(img.modelId)?.name} · {timeAgo(img.createdAt)}
                </small>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="reveal gl-empty">
          <Empty icon="image" title="No images yet" text={ws.images.length ? 'No images match these filters.' : 'Generate your first image in the chat to see it here.'}>
            <button className="k-btn primary shine" onClick={() => navigate('/app/chat')}>
              Go to chat →
            </button>
          </Empty>
          <div className="gl-ghosts" aria-hidden>
            {[210, 290, 330, 20].map((h, i) => (
              <span key={i} style={{ ['--i' as string]: i }}>
                <Art hue={h} />
              </span>
            ))}
          </div>
        </div>
      )}

      <Modal open={!!open} onClose={() => setOpen(null)} className="gl-lb" label="Image">
        {open && (
          <>
            <Art hue={open.hue} className="gl-lb-art" />
            <div className="gl-lb-side k-stagger">
              <small className="k-kicker">Prompt</small>
              <p>{open.prompt}</p>
              <small>
                {modelById(open.modelId)?.name} · {timeAgo(open.createdAt)}
              </small>
              <div className="np-actions">
                <button className="k-btn ghost" onClick={() => setOpen(null)}>
                  Close
                </button>
                <button className="k-btn primary" onClick={() => ws.toast('Download starts once the backend serves real files')}>
                  <Icon name="download" size={16} /> Download
                </button>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}

export function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { id: string; label: string }[] }) {
  const [open, setOpen] = useState(false)
  const ref = useDismiss<HTMLDivElement>(open, () => setOpen(false))
  const pop = usePop<HTMLDivElement>(open, { y: -6 })
  return (
    <div ref={ref} className="k-select">
      <button className={open ? 'on' : ''} onClick={() => setOpen((o) => !o)}>
        {options.find((o) => o.id === value)?.label}
        <Icon name="chevronDown" size={15} />
      </button>
      {open && (
        <div ref={pop} className="ks-pop k-select-menu">
          {options.map((o) => (
            <button
              key={o.id}
              className={`pop-item ${o.id === value ? 'on' : ''}`}
              onClick={() => {
                onChange(o.id)
                setOpen(false)
              }}
            >
              {o.label}
              {o.id === value && <Icon name="check" size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
