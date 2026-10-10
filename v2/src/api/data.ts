import type { Model, PricingPlan } from './types'

export const MODELS: Model[] = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', vendor: 'Google', tier: 'standard', cost: 1, color: '#67e8f9', strengths: ['writing', 'speed'] },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', vendor: 'OpenAI', tier: 'standard', cost: 1, color: '#4ade80', strengths: ['chat', 'summaries'] },
  { id: 'mistral-small-4', name: 'Mistral Small 4', vendor: 'Mistral', tier: 'standard', cost: 1, color: '#fb923c', strengths: ['translation'] },
  { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', vendor: 'Meta', tier: 'standard', cost: 1, color: '#60a5fa', strengths: ['open weights'] },
  { id: 'gpt-5.4', name: 'GPT-5.4', vendor: 'OpenAI', tier: 'advanced', cost: 6, color: '#34d399', strengths: ['code', 'reasoning'] },
  { id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro', vendor: 'Google', tier: 'advanced', cost: 5, color: '#22d3ee', strengths: ['analysis', 'long context'] },
  { id: 'grok-4.20', name: 'Grok 4.20', vendor: 'xAI', tier: 'advanced', cost: 2, color: '#f472b6', strengths: ['current events'] },
  { id: 'claude-sonnet-4.6', name: 'Claude Sonnet 4.6', vendor: 'Anthropic', tier: 'premium', cost: 6, color: '#fbbf24', strengths: ['code', 'web pages', 'writing'] },
  { id: 'claude-opus-4.7', name: 'Claude Opus 4.7', vendor: 'Anthropic', tier: 'premium', cost: 15, color: '#f59e0b', strengths: ['deep reasoning', 'agents'] },
  { id: 'flux-2-klein', name: 'FLUX.2 Klein', vendor: 'Black Forest Labs', tier: 'standard', cost: 4, color: '#e879f9', strengths: ['images'] },
  { id: 'nano-banana-2', name: 'Nano Banana 2', vendor: 'Google', tier: 'advanced', cost: 5, color: '#facc15', strengths: ['images', 'editing'] },
]

export const modelById = (id?: string) => MODELS.find((m) => m.id === id)

export const PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free & PayG',
    tagline: 'Start free, pay as you grow',
    monthly: 0,
    yearly: 0,
    features: [
      '50 free credits daily — no card needed',
      'Standard + Advanced AI models',
      'Web search, images, video',
      'Voice input, live mode, compare',
      'Wallet never expires',
    ],
    cta: 'Get started free',
  },
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'For regular use, without the full commitment',
    monthly: 6.99,
    yearly: 76.89,
    features: [
      '2,500 credits every month',
      '5 images · 3 document downloads /mo',
      '2 deep research sessions /mo',
      'Wallet overage — never blocked',
      'Higher rate limits & longer responses',
    ],
    cta: 'Get Starter',
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'For daily AI users',
    monthly: 19,
    yearly: 209,
    badge: 'Most popular',
    features: [
      'Claude Sonnet & Opus included',
      '8,000 credits every month',
      '20 images · 10 docs · 500 searches /mo',
      '5 deep research sessions /mo',
      '60 min voice live per month',
    ],
    cta: 'Upgrade to Pro',
  },
  {
    id: 'promax',
    name: 'Pro Max',
    tagline: 'For power users & builders',
    monthly: 149,
    yearly: 1639,
    badge: 'Most powerful',
    features: [
      '10 agent missions /month included',
      '80,000 credits every month',
      '100 images · 50 docs · unlimited search',
      '5 videos · 300 min voice live /mo',
      '$2.50 / mission overage — flat rate',
    ],
    cta: 'Upgrade to Pro Max',
  },
]
