import { Arrow, Magnetic } from '../components/ui'
import { Rays } from '../components/Rays'

export default function NotFound() {
  return (
    <div className="nf">
      <Rays focal={[0.5, 0.5]} intensity={0.8} />
      <div className="nf-in">
        <span className="kicker">Error 404</span>
        <h1 className="h-xl metal">Nothing converges here.</h1>
        <p className="lede">This page doesn’t exist — but every model is still one click away.</p>
        <Magnetic to="/" className="btn btn-white btn-lg">
          Back home <Arrow />
        </Magnetic>
      </div>
      <style>{`
        .nf{position:relative;min-height:100svh;display:grid;place-items:center;overflow:hidden;padding:24px}
        .nf-in{position:relative;display:grid;justify-items:center;gap:20px;text-align:center;max-width:760px}
        .nf .lede{text-align:center}
      `}</style>
    </div>
  )
}
