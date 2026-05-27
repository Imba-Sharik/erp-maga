import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { useCurrentUser } from '@/entities/current-user'
import type { ProjectStage } from '@/entities/project'

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
        set((s) => {
          const key = draftKey(projectId, draft.authorId)
          const existing = s.drafts[key]
          return {
            drafts: {
              ...s.drafts,
              [key]: {
                ...existing,
                ...draft,
                highlightPending: draft.highlightPending ?? existing?.highlightPending ?? false,
              },
            },
          }
        }),
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
  /** Пометить черновик для подсветки — вызывается при уходе со страницы проекта. */
  markHighlightPending: (projectId: string | number, authorId: string): void => {
    const draft = stageDraftActions.get(projectId, authorId)
    if (!draft) return
    stageDraftActions.save(projectId, { ...draft, highlightPending: true })
  },
}

/** Реактивная карта всех черновиков — для подсветки карточек в канбане. */
export const useStageDrafts = (): Record<string, StageDraft> => useStageDraftStore((s) => s.drafts)

/** Черновик текущего пользователя по проекту. */
export function useProjectStageDraft(
  projectId: string | number | undefined,
): StageDraft | undefined {
  const currentUser = useCurrentUser()
  return useStageDraftStore((s) =>
    projectId === undefined ? undefined : s.drafts[draftKey(projectId, currentUser.id)],
  )
}

/** Есть ли незавершённый черновик на конкретном этапе проекта. */
export function useStageHasDraftHighlight(
  projectId: string | number | undefined,
  stage: ProjectStage,
): boolean {
  const draft = useProjectStageDraft(projectId)
  return draft?.stage === stage && Boolean(draft.highlightPending)
}

/** Подсветка карточки проекта в канбане. */
export function useProjectDraftHighlight(projectId: string | number | undefined): boolean {
  const draft = useProjectStageDraft(projectId)
  return Boolean(draft?.highlightPending)
}
