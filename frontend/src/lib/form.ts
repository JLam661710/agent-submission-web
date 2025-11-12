import type { Input } from './api'

export const DRAFT_KEY = 'questionnaire_draft'
export const DRAFT_META_KEY = 'questionnaire_draft_meta'

export function clampScore(n: any): number | undefined {
  const x = Number(n)
  if (!Number.isFinite(x)) return undefined
  return Math.min(5, Math.max(1, Math.round(x)))
}

export function loadDraft(): Input {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? (JSON.parse(raw) as Input) : { nickname: '' }
  } catch {
    return { nickname: '' }
  }
}

export function saveDraft(input: Input) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(input)) } catch {}
}

export function computePercent(input: Input): number {
  const keys: (keyof Input)[] = [
    'nickname','role_tags','recent_annoyance','skills','interest_score','interest_description','learning_attitude_sc','people_around_challe','community_voices','collaboration_prefer','tool_idea','confidence_score','learning_goal'
  ]
  const filled = keys.filter(k => {
    const v = (input as any)[k]
    return v !== undefined && v !== null && String(v).trim() !== ''
  }).length
  return Math.round((filled / keys.length) * 100)
}

export type DraftMeta = {
  collaboration_prefer_note?: string
}

export function loadMeta(): DraftMeta {
  try {
    const raw = localStorage.getItem(DRAFT_META_KEY)
    return raw ? (JSON.parse(raw) as DraftMeta) : {}
  } catch {
    return {}
  }
}

export function saveMeta(meta: DraftMeta) {
  try { localStorage.setItem(DRAFT_META_KEY, JSON.stringify(meta)) } catch {}
}