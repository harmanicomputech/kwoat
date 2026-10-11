// Shapes the backend is expected to return. The mock in ./mock.ts produces
// exactly these, so swapping in the real API should not touch any screen.

export type Tier = 'standard' | 'advanced' | 'premium'
export type Plan = 'free' | 'starter' | 'pro' | 'promax'

export interface Model {
  id: string
  name: string
  vendor: string
  tier: Tier
  /** Approximate credits per typical response */
  cost: number
  color: string
  strengths: string[]
}

export interface User {
  id: string
  name: string
  email: string
  plan: Plan
  credits: { standard: number; advanced: number; premium: number }
  images: { used: number; limit: number }
}

export type Role = 'user' | 'assistant'

export interface Message {
  id: string
  role: Role
  content: string
  modelId?: string
  cost?: number
  createdAt: number
}

export interface Conversation {
  id: string
  title: string
  updatedAt: number
  messages: Message[]
}

export interface RouteDecision {
  modelId: string
  reason: string
  confidence: number
}

export interface StreamHandlers {
  onRoute?: (decision: RouteDecision) => void
  onToken: (token: string) => void
  onDone: (final: { cost: number; modelId: string }) => void
  signal?: AbortSignal
}

export interface GalleryImage {
  id: string
  prompt: string
  modelId: string
  createdAt: number
  /** Gradient seed used by the mock renderer until real URLs exist */
  hue: number
  url?: string
}

export type MissionStepKind = 'think' | 'search' | 'write' | 'run' | 'fix' | 'done'

export interface MissionStep {
  id: string
  kind: MissionStepKind
  label: string
  detail?: string
}

export interface Mission {
  id: string
  goal: string
  status: 'running' | 'done' | 'stopped'
  steps: MissionStep[]
  files: string[]
}

export interface UsagePoint {
  date: string
  credits: number
  byModel: Record<string, number>
}

export interface PricingPlan {
  id: Plan
  name: string
  tagline: string
  monthly: number
  yearly: number
  badge?: string
  features: string[]
  cta: string
}
