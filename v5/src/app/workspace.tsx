// Everything the signed-in app remembers between screens: conversations,
// projects, the wallet, daily credits, usage records and generated images.
// It lives in the browser (localStorage) until the backend exists; each
// action maps onto one endpoint listed in README.md.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { GalleryImage, Message } from '../api'

export type UsageType = 'chat' | 'search' | 'document' | 'image' | 'video'

export interface ChatMessage extends Message {
  image?: { hue: number; prompt: string }
  reason?: string
  tokens?: number
  blocked?: boolean
}
export interface Conversation {
  id: string
  title: string
  projectId?: string
  updatedAt: number
  messages: ChatMessage[]
}
export interface Project {
  id: string
  name: string
  kind: 'chat' | 'mission'
  createdAt: number
}
export interface Txn {
  id: string
  kind: 'topup' | 'spend'
  amount: number
  label: string
  at: number
}
export interface UsageRecord {
  id: string
  at: number
  modelId: string
  credits: number
  tokens: number
  type: UsageType
}

interface Data {
  conversations: Conversation[]
  projects: Project[]
  balance: number
  txns: Txn[]
  usage: UsageRecord[]
  images: GalleryImage[]
  daily: { used: number; limit: number; day: string }
}

/** Free credits each day; beyond that, chats are paid from the wallet. */
export const DAILY_CREDITS = 50
/** Wallet price of one credit, in USD. */
export const CREDIT_PRICE = 0.01

const KEY = 'kwoat4-workspace'
const today = () => new Date().toISOString().slice(0, 10)
export const uid = () => Math.random().toString(36).slice(2, 10)

const empty = (): Data => ({
  conversations: [],
  projects: [],
  balance: 0,
  txns: [],
  usage: [],
  images: [],
  daily: { used: 0, limit: DAILY_CREDITS, day: today() },
})

function load(): Data {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const d = { ...empty(), ...JSON.parse(raw) } as Data
      if (d.daily.day !== today()) d.daily = { used: 0, limit: DAILY_CREDITS, day: today() }
      return d
    }
  } catch {
    /* storage blocked or corrupt — start fresh */
  }
  return empty()
}

export interface Prefs {
  theme: 'light' | 'dark' | 'system'
  fontSize: 'sm' | 'md' | 'lg'
  font: 'system' | 'serif' | 'mono' | 'humanist' | 'literary'
  defaultModel: string
  hidden: string[]
  notify: Record<'credits' | 'wallet' | 'receipts' | 'product', boolean>
  profile: { fullName: string; displayName: string; phone: string; country: string }
  integrations: string[]
  memberSince: number
}
const PREFS_KEY = 'kwoat4-prefs'
const defaultPrefs = (): Prefs => ({
  theme: 'light',
  fontSize: 'md',
  font: 'system',
  defaultModel: 'auto',
  hidden: [],
  notify: { credits: true, wallet: true, receipts: true, product: true },
  profile: { fullName: '', displayName: '', phone: '', country: '' },
  integrations: [],
  memberSince: Date.now(),
})
function loadPrefs(): Prefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (raw) return { ...defaultPrefs(), ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return defaultPrefs()
}

type Modal = null | 'search' | 'project' | 'topup'
export interface Toast {
  id: string
  text: string
  tone?: 'ok' | 'info' | 'warn'
}

interface Workspace extends Data {
  creditsLeft: number
  /** Saves a conversation, creating it if new, and moves it to the top. */
  saveConversation: (c: Conversation) => void
  deleteConversation: (id: string) => void
  addProject: (name: string, kind: Project['kind']) => Project
  topUp: (amount: number) => void
  /** Charges credits for one request; false when neither daily credits nor wallet cover it. */
  charge: (r: Omit<UsageRecord, 'id' | 'at'>) => boolean
  canAfford: (credits: number) => boolean
  addImage: (img: GalleryImage) => void
  reset: () => void
  prefs: Prefs
  setPrefs: (p: Partial<Prefs>) => void
  modal: Modal
  openModal: (m: Modal) => void
  toasts: Toast[]
  toast: (text: string, tone?: Toast['tone']) => void
}

const Ctx = createContext<Workspace | null>(null)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(load)
  const [modal, openModal] = useState<Modal>(null)
  const [prefs, setAll] = useState<Prefs>(loadPrefs)
  const setPrefs = useCallback((p: Partial<Prefs>) => setAll((x) => ({ ...x, ...p })), [])
  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
    } catch {
      /* ignore */
    }
  }, [prefs])
  const [toasts, setToasts] = useState<Toast[]>([])
  const dataRef = useRef(data)
  dataRef.current = data

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data))
    } catch {
      /* ignore */
    }
  }, [data])

  const toast = useCallback((text: string, tone: Toast['tone'] = 'info') => {
    const id = uid()
    setToasts((t) => [...t, { id, text, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600)
  }, [])

  const saveConversation = useCallback(
    (c: Conversation) =>
      setData((d) => ({ ...d, conversations: [{ ...c, updatedAt: Date.now() }, ...d.conversations.filter((x) => x.id !== c.id)] })),
    [],
  )
  const deleteConversation = useCallback(
    (id: string) => setData((d) => ({ ...d, conversations: d.conversations.filter((x) => x.id !== id) })),
    [],
  )
  const addProject = useCallback((name: string, kind: Project['kind']) => {
    const p: Project = { id: uid(), name, kind, createdAt: Date.now() }
    setData((d) => ({ ...d, projects: [p, ...d.projects] }))
    return p
  }, [])
  const topUp = useCallback(
    (amount: number) =>
      setData((d) => ({
        ...d,
        balance: +(d.balance + amount).toFixed(2),
        txns: [{ id: uid(), kind: 'topup', amount, label: 'Wallet top-up', at: Date.now() }, ...d.txns],
      })),
    [],
  )

  const canAfford = useCallback((credits: number) => {
    const d = dataRef.current
    const free = Math.max(0, d.daily.limit - d.daily.used)
    return free >= credits || d.balance >= (credits - free) * CREDIT_PRICE
  }, [])

  const charge = useCallback(
    (r: Omit<UsageRecord, 'id' | 'at'>) => {
      if (!canAfford(r.credits)) return false
      setData((d) => {
        const free = Math.max(0, d.daily.limit - d.daily.used)
        const fromFree = Math.min(free, r.credits)
        const paid = +((r.credits - fromFree) * CREDIT_PRICE).toFixed(2)
        return {
          ...d,
          daily: { ...d.daily, used: d.daily.used + fromFree },
          balance: +(d.balance - paid).toFixed(2),
          txns: paid > 0 ? [{ id: uid(), kind: 'spend', amount: paid, label: `${r.credits} credits · ${r.modelId}`, at: Date.now() }, ...d.txns] : d.txns,
          usage: [{ ...r, id: uid(), at: Date.now() }, ...d.usage],
        }
      })
      return true
    },
    [canAfford],
  )

  const addImage = useCallback((img: GalleryImage) => setData((d) => ({ ...d, images: [img, ...d.images] })), [])
  const reset = useCallback(() => setData(empty()), [])

  const value = useMemo<Workspace>(
    () => ({
      ...data,
      creditsLeft: Math.max(0, data.daily.limit - data.daily.used),
      saveConversation,
      deleteConversation,
      addProject,
      topUp,
      charge,
      canAfford,
      addImage,
      reset,
      prefs,
      setPrefs,
      modal,
      openModal,
      toasts,
      toast,
    }),
    [data, saveConversation, deleteConversation, addProject, topUp, charge, canAfford, addImage, reset, prefs, setPrefs, modal, toasts, toast],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useWorkspace() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useWorkspace must be used inside <WorkspaceProvider>')
  return c
}

export const money = (n: number) => `$${n.toFixed(2)}`
