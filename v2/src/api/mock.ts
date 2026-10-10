// In-browser stand-in for the backend. Every function here has the same
// signature as its counterpart in ./http.ts.
import { MODELS } from './data'
import type {
  Conversation,
  GalleryImage,
  Mission,
  MissionStep,
  RouteDecision,
  StreamHandlers,
  UsagePoint,
  User,
} from './types'

const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(t)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })

const uid = () => Math.random().toString(36).slice(2, 10)

let currentUser: User | null = null

export async function login(email: string, _password: string): Promise<User> {
  await wait(700)
  currentUser = {
    id: uid(),
    name: email.split('@')[0].replace(/\W+/g, ' ').trim() || 'Friend',
    email,
    plan: 'pro',
    credits: { standard: 5495, advanced: 2000, premium: 0 },
    images: { used: 5, limit: 20 },
  }
  return currentUser
}

export async function signup(name: string, email: string, password: string): Promise<User> {
  const user = await login(email, password)
  user.name = name
  user.plan = 'free'
  return user
}

export async function me(): Promise<User | null> {
  return currentUser
}

export async function logout(): Promise<void> {
  currentUser = null
}

/** Keyword router — the real one lives server-side. */
export function route(prompt: string): RouteDecision {
  const p = prompt.toLowerCase()
  const pick = (modelId: string, reason: string, confidence = 0.92) => ({ modelId, reason, confidence })
  if (/(image|picture|draw|logo|poster|illustration)/.test(p)) return pick('flux-2-klein', 'Image request → fast diffusion model')
  if (/(landing page|website|html|ui|component)/.test(p)) return pick('claude-sonnet-4.6', 'Web build → strongest at code + live preview', 0.95)
  if (/(bug|debug|code|function|error|typescript|python|sql)/.test(p)) return pick('gpt-5.4', 'Code task → best debugging model')
  if (/(analy|data|report|compare|spreadsheet|numbers)/.test(p)) return pick('gemini-3.1-pro', 'Analysis → long-context reasoning', 0.88)
  if (/(news|today|latest|trending)/.test(p)) return pick('grok-4.20', 'Current events → live web model', 0.84)
  if (/(poem|story|write|essay|email|caption)/.test(p)) return pick('gemini-2.5-flash', 'Creative writing → quick & cheap', 0.9)
  return pick('gpt-4o-mini', 'General question → fast, low cost', 0.8)
}

const SAMPLE_REPLIES: Record<string, string> = {
  'flux-2-klein':
    "Here's your image. I generated four variations and saved them to your Gallery — tap any one to upscale, vary or download.",
  'claude-sonnet-4.6':
    "I've built the page as a single responsive file: a bold hero with a gradient headline, a three-column feature grid, social proof, and a pricing table. The live preview is open on the right — tell me what to tweak and I'll update it instantly.",
  'gpt-5.4':
    "Found it. The bug is an off-by-one in your loop: `i <= items.length` reads past the end of the array, so the last iteration gets `undefined`. Change it to `i < items.length` — or better, use `for (const item of items)` so it can't happen again.",
  'gemini-3.1-pro':
    'Three things stand out in the data: revenue is up 18% quarter-on-quarter, but it is concentrated — the top two customers account for 61%. Churn is flat at 2.1%. I would prioritise diversifying the customer base before scaling spend.',
  'grok-4.20':
    "Here's what's moving right now, with sources: I checked the latest reports from the past few hours and summarised the three stories getting the most attention, plus what changed since yesterday.",
  'gemini-2.5-flash':
    'Between the hum of the city and the hush of the sea,\nthere is a quiet place that waits for me —\nwhere every question finds the voice it needs,\nand every answer grows from patient seeds.',
  'gpt-4o-mini':
    "Great question. In short: yes — and here's the quick version, followed by the details if you want to go deeper.",
}

export function replyFor(modelId: string) {
  return SAMPLE_REPLIES[modelId] ?? SAMPLE_REPLIES['gpt-4o-mini']
}

export async function streamChat(prompt: string, modelId: string | 'auto', h: StreamHandlers): Promise<void> {
  const decision = modelId === 'auto' ? route(prompt) : { modelId, reason: 'Chosen manually', confidence: 1 }
  await wait(450, h.signal)
  h.onRoute?.(decision)
  await wait(350, h.signal)
  const text = replyFor(decision.modelId)
  const tokens = text.match(/\S+\s*|\n/g) ?? [text]
  for (const t of tokens) {
    await wait(18 + Math.random() * 40, h.signal)
    h.onToken(t)
  }
  const model = MODELS.find((m) => m.id === decision.modelId)
  h.onDone({ cost: model?.cost ?? 1, modelId: decision.modelId })
}

export async function listConversations(): Promise<Conversation[]> {
  const now = Date.now()
  const titles = [
    'Landing page for a coffee brand',
    'Fix the auth middleware bug',
    'Q3 revenue analysis',
    'Poem for mum’s birthday',
    'Logo concepts — neon fox',
    'Explain vector databases',
  ]
  return titles.map((title, i) => ({ id: uid(), title, updatedAt: now - i * 36e5 * (i + 1), messages: [] }))
}

export async function listImages(): Promise<GalleryImage[]> {
  const prompts = [
    'Neon fox in a rainy Tokyo alley, cinematic',
    'Minimal logo, violet gradient, letter K',
    'Isometric floating island with waterfalls',
    'Portrait of an astronaut made of flowers',
    'Brutalist building at golden hour',
    'Abstract liquid chrome, purple light',
    'Retro-futuristic Lagos skyline, 2080',
    'Macro shot of a dew drop on a leaf',
    'Paper-cut art of a mountain range',
  ]
  return prompts.map((prompt, i) => ({
    id: uid(),
    prompt,
    modelId: i % 3 === 0 ? 'nano-banana-2' : 'flux-2-klein',
    createdAt: Date.now() - i * 864e5,
    hue: (i * 47 + 250) % 360,
  }))
}

export async function generateImage(prompt: string): Promise<GalleryImage> {
  await wait(2200)
  return { id: uid(), prompt, modelId: 'flux-2-klein', createdAt: Date.now(), hue: Math.floor(Math.random() * 360) }
}

const MISSION_SCRIPT: Omit<MissionStep, 'id'>[] = [
  { kind: 'think', label: 'Planning the build', detail: 'Express + TypeScript, JWT auth, PostgreSQL, Zod validation' },
  { kind: 'search', label: 'Searching best practices', detail: 'refresh-token rotation, bcrypt cost factor' },
  { kind: 'write', label: 'Writing file', detail: 'package.json' },
  { kind: 'write', label: 'Writing file', detail: 'tsconfig.json' },
  { kind: 'write', label: 'Writing file', detail: 'src/db/pool.ts' },
  { kind: 'write', label: 'Writing file', detail: 'src/utils/jwt.ts' },
  { kind: 'write', label: 'Writing file', detail: 'src/middleware/auth.ts' },
  { kind: 'run', label: 'Running tests', detail: '23 passed, 1 failed' },
  { kind: 'fix', label: 'Fixing failing test', detail: 'token expiry used seconds, expected ms' },
  { kind: 'run', label: 'Running tests', detail: '24 passed' },
  { kind: 'done', label: 'Mission complete', detail: '14 files ready to download' },
]

export async function runMission(goal: string, onStep: (m: Mission) => void, signal?: AbortSignal): Promise<Mission> {
  const mission: Mission = { id: uid(), goal, status: 'running', steps: [], files: [] }
  onStep({ ...mission })
  for (const s of MISSION_SCRIPT) {
    await wait(700 + Math.random() * 700, signal)
    mission.steps = [...mission.steps, { ...s, id: uid() }]
    if (s.kind === 'write' && s.detail) mission.files = [...mission.files, s.detail]
    if (s.kind === 'done') mission.status = 'done'
    onStep({ ...mission })
  }
  return mission
}

export async function usage(days = 30): Promise<UsagePoint[]> {
  const ids = ['gemini-2.5-flash', 'gpt-5.4', 'claude-sonnet-4.6', 'gemini-3.1-pro', 'flux-2-klein']
  const out: UsagePoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 864e5)
    const byModel: Record<string, number> = {}
    let total = 0
    ids.forEach((id, k) => {
      const v = Math.max(0, Math.round(20 + 30 * Math.sin((i + k * 3) / 4) + Math.random() * 25 - k * 6))
      byModel[id] = v
      total += v
    })
    out.push({ date: d.toISOString().slice(0, 10), credits: total, byModel })
  }
  return out
}
