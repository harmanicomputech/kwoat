import { Btn } from '../components/ui'
import { SplitFlap } from '../components/SplitFlap'
import { DitherField } from '../components/DitherField'

export default function NotFound() {
  return (
    <div className="nf">
      <DitherField cell={4} density={1.3} fadeLeft={false} />
      <div className="nf-box">
        <span className="label">Error · route not found</span>
        <SplitFlap value="404" length={3} className="flap-xl" />
        <p className="display">
          Even the best router
          <br />
          <em>can’t find this page.</em>
        </p>
        <Btn to="/">Back home</Btn>
      </div>
      <style>{`
        .nf{position:relative;min-height:100svh;display:grid;place-items:center;padding:24px;overflow:hidden}
        .nf-box{position:relative;display:grid;justify-items:center;gap:22px;text-align:center;background:var(--paper);padding:36px 40px;border:1px solid var(--ink)}
        .nf .display{font-size:clamp(30px,4vw,54px)}
      `}</style>
    </div>
  )
}
