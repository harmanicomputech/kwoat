import { Arrow, Magnetic, Mark } from '../components/ui'

export default function NotFound() {
  return (
    <div className="nf">
      <div className="nf-blob" aria-hidden />
      <div className="nf-in">
        <Mark size={56} className="nf-mark" />
        <h1 className="display h-hero">
          <span className="grad-text">404</span>
        </h1>
        <p className="lede">Even the best router can’t find this page.</p>
        <Magnetic to="/" className="btn btn-primary btn-lg">
          Back home <Arrow />
        </Magnetic>
      </div>
      <style>{`
        .nf{position:relative;min-height:100svh;display:grid;place-items:center;overflow:hidden;padding:24px}
        .nf-blob{position:absolute;width:70vmax;height:70vmax;border-radius:50%;background:conic-gradient(from 0deg,#c4b5fd,#f9a8d4,#fed7aa,#bae6fd,#c4b5fd);filter:blur(90px);opacity:.55;animation:rot 18s linear infinite}
        .nf-in{position:relative;display:grid;justify-items:center;gap:22px;text-align:center}
        .nf-mark{color:var(--violet);animation:floaty 4s ease-in-out infinite}
        @keyframes floaty{50%{transform:translateY(-14px) rotate(-6deg)}}
        .nf .lede{text-align:center}
      `}</style>
    </div>
  )
}
