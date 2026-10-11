import { useEffect, useRef } from 'react'
import { gsap } from '../lib/motion'

// "Powered by" strip: one slow row of provider cards. Each card has a glyph
// drawn for this site (not the provider's trademark), the provider name and
// its models. Cards rest in soft grey and colour up on hover; the row pauses
// on hover and fades out at both edges.

type Provider = { name: string; models: string; color: string; glyph: React.ReactNode }

const G = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

const PROVIDERS: Provider[] = [
  {
    name: 'OpenAI',
    models: 'GPT-5.4 · GPT-4o Mini',
    color: '#10b981',
    glyph: (
      <g {...G}>
        {Array.from({ length: 6 }).map((_, i) => (
          <ellipse key={i} cx="12" cy="7.5" rx="3" ry="5" transform={`rotate(${i * 60} 12 12)`} />
        ))}
      </g>
    ),
  },
  {
    name: 'Anthropic',
    models: 'Claude Sonnet 4.6 · Opus 4.7',
    color: '#d97706',
    glyph: (
      <g {...G}>
        <path d="M5 19 10.5 5h3L19 19" />
        <path d="M8 13.5h8" />
      </g>
    ),
  },
  {
    name: 'Google',
    models: 'Gemini 3.1 Pro · 2.5 Flash · Nano Banana 2',
    color: '#3b82f6',
    glyph: (
      <g {...G}>
        <path d="M12 3c.6 4.8 4.2 8.4 9 9-4.8.6-8.4 4.2-9 9-.6-4.8-4.2-8.4-9-9 4.8-.6 8.4-4.2 9-9Z" />
      </g>
    ),
  },
  {
    name: 'xAI',
    models: 'Grok 4.20',
    color: '#64748b',
    glyph: (
      <g {...G}>
        <path d="M5 5l14 14M19 5 13.5 10.5M10.5 13.5 5 19" />
      </g>
    ),
  },
  {
    name: 'Meta',
    models: 'Llama 3.3 70B',
    color: '#2563eb',
    glyph: (
      <g {...G}>
        <path d="M3.5 15c0-4 2-7 4.2-7 3.3 0 5.3 8 8.6 8 2 0 4.2-2 4.2-5s-1.6-5-3.8-5c-3.5 0-5.3 9-9 9C5 15 3.5 15.8 3.5 15Z" />
      </g>
    ),
  },
  {
    name: 'Mistral AI',
    models: 'Mistral Small 4',
    color: '#f97316',
    glyph: (
      <g {...G}>
        <path d="M4 19V5h4v5h3V5h2v5h3V5h4v14M8 14h8" />
      </g>
    ),
  },
  {
    name: 'Black Forest Labs',
    models: 'FLUX.2 Klein',
    color: '#a855f7',
    glyph: (
      <g {...G}>
        <path d="M7 4 2.5 12h3L2 18h10l-3.5-6h3L7 4Z" />
        <path d="M16 7l-4 7h2.5L12 18h10l-3-4h2.5L16 7Z" />
      </g>
    ),
  },
]

function Card({ p }: { p: Provider }) {
  return (
    <div className="lg-card" style={{ ['--c' as string]: p.color }}>
      <span className="lg-tile">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
          {p.glyph}
        </svg>
      </span>
      <span className="lg-text">
        <b>{p.name}</b>
        <small>{p.models}</small>
      </span>
    </div>
  )
}

export function Logos() {
  const root = useRef<HTMLElement>(null)
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.lg-head > *', { y: 20, opacity: 0, duration: 1, ease: 'kwoat', stagger: 0.08, scrollTrigger: { trigger: root.current, start: 'top 85%' } })
      gsap.from('.lg-viewport', { opacity: 0, y: 24, duration: 1.2, ease: 'kwoat', scrollTrigger: { trigger: root.current, start: 'top 85%' } })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="logos" id="models" aria-label="Model providers">
      <div className="container lg-head">
        <p className="lg-kicker">Powered by every frontier model</p>
        <h2 className="lg-title">
          13+ models from the world’s leading AI labs — <span className="grad-text">one prompt box.</span>
        </h2>
      </div>
      <div className="lg-viewport">
        <div className="lg-track">
          {[0, 1].map((copy) => (
            <div className="lg-set" key={copy} aria-hidden={copy === 1}>
              {PROVIDERS.map((p) => (
                <Card key={p.name} p={p} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
