import { Icon } from '../components/ui'

// Placeholder quotes for the pitch — replace with real customer quotes before launch.
const QUOTES = [
  { q: 'I cancelled three AI subscriptions the week I found Kwoat. Same models, one bill, and I pay less.', n: 'Ada Okafor', r: 'Product designer', c: '#8b5cf6' },
  { q: 'Auto mode is the killer feature. I just type — it sends code to GPT and copy to Claude without me thinking about it.', n: 'Tunde Bakare', r: 'Full-stack developer', c: '#10b981' },
  { q: 'Compare mode settles every argument in our team. Four answers, side by side, in seconds.', n: 'Grace Mensah', r: 'Head of content', c: '#f59e0b' },
  { q: 'The wallet is genius. Some months I barely use it, so I barely pay.', n: 'Kwame Asante', r: 'Freelance writer', c: '#3b82f6' },
  { q: 'Missions built a working API with tests while I was in a meeting. I just reviewed and shipped it.', n: 'Lerato Dlamini', r: 'Startup founder', c: '#ec4899' },
  { q: 'I generate product shots with FLUX and write the captions with Gemini — without leaving the chat.', n: 'Chiamaka Eze', r: 'E-commerce owner', c: '#14b8a6' },
  { q: 'Voice live on my commute has replaced half my typing. It feels like talking to a colleague.', n: 'David Mwangi', r: 'Sales lead', c: '#f97316' },
  { q: 'Deep research with real sources means I can trust what I hand to clients.', n: 'Amara Nwosu', r: 'Consultant', c: '#6366f1' },
  { q: 'The cleanest AI app I have used. Fast, simple, and every model is right there.', n: 'Samuel Osei', r: 'Student', c: '#22c55e' },
]

export function Testimonials() {
  const cols = [QUOTES.slice(0, 3), QUOTES.slice(3, 6), QUOTES.slice(6, 9)]
  return (
    <section className="ts5 sec5" id="voices">
      <div className="container">
        <div className="sec5-head">
          <span className="kick5" data-reveal>
            <Icon name="chat" size={14} /> Loved by people who get things done
          </span>
          <h2 data-split>Fewer apps. Better answers.</h2>
        </div>
        <div className="ts5-wall" data-reveal>
          {cols.map((col, i) => (
            <div key={i} className="ts5-col" style={{ ['--dur' as string]: `${38 + i * 8}s`, ['--dir' as string]: i === 1 ? 'reverse' : 'normal' }}>
              <div className="ts5-track">
                {[...col, ...col].map((t, k) => (
                  <figure key={k} className="ts5-card" aria-hidden={k >= col.length}>
                    <div className="ts5-stars" aria-label="5 stars">
                      {'★★★★★'}
                    </div>
                    <blockquote>“{t.q}”</blockquote>
                    <figcaption>
                      <span className="ts5-av" style={{ background: t.c }}>
                        {t.n
                          .split(' ')
                          .map((p) => p[0])
                          .join('')}
                      </span>
                      <span>
                        <b>{t.n}</b>
                        <small>{t.r}</small>
                      </span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
