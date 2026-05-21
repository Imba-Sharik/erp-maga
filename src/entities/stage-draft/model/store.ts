import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { StageDraft } from './types'

const STAGE_DRAFTS_STORAGE_KEY = 'mag-erp-stage-drafts'

/** Ключ черновика — пара «проект + автор»: у каждого пользователя свой черновик по проекту. */
export function draftKey(projectId: string | number, authorId: string): string {
  return `${projectId}:${authorId}`
}

interface StageDraftState {
  /** Черновики по ключу `draftKey`. */
  drafts: Record<string, StageDraft>
  saveDraft: (projectId: string | number, draft: StageDraft) => void
  clearDraft: (projectId: string | number, authorId: string) => void
}

/** Стор черновиков с persist: черновик должен переживать перезагрузку и возврат к проекту. */
export const useStageDraftStore = create<StageDraftState>()(
  persist(
    (set) => ({
      drafts: {},
      saveDraft: (projectId, draft) =>
        set((s) => ({
          drafts: { ...s.drafts, [draftKey(projectId, draft.authorId)]: draft },
        })),
      clearDraft: (projectId, authorId) =>
        set((s) => {
          const key = draftKey(projectId, authorId)
          if (!(key in s.drafts)) return s
          const next = { ...s.drafts }
          delete next[key]
          return { drafts: next }
        }),
    }),
    { name: STAGE_DRAFTS_STORAGE_KEY },
  ),
)

/** Неподписочный доступ — для колбэков и эффектов вне рендера. */
export const stageDraftActions = {
  get: (projectId: string | number, authorId: string): StageDraft | undefined =>
    useStageDraftStore.getState().drafts[draftKey(projectId, authorId)],
  save: (projectId: string | number, draft: StageDraft): void =>
    useStageDraftStore.getState().saveDraft(projectId, draft),
  clear: (projectId: string | number, authorId: string): void =>
    useStageDraftStore.getState().clearDraft(projectId, authorId),
}

/** Реактивная карта всех черновиков — для подсветки карточек в канбане. */
export const useStageDrafts = (): Record<string, StageDraft> =>
  useStageDraftStore((s) => s.drafts)
