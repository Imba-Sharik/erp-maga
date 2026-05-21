import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useCurrentUser } from '@/entities/current-user'
import { getStageNotification, useNotificationStore } from '@/entities/notification'
import {
  ALL_STAGE_ORDER,
  type ProjectStage,
  type StageFormData,
} from '@/entities/project'
import {
  createEmptyBacklineBlock,
  createInitialArticles,
  type ArticleBlock,
  type ArticleKind,
  type ArticleValues,
  type ProjectArticles,
} from '@/entities/project-articles'
import { stageDraftActions } from '@/entities/stage-draft'
import { projectsListQueryKey } from '@/shared/api/generated/hooks/projectsController/useProjectsList'
import { projectsRetrieveQueryKey } from '@/shared/api/generated/hooks/projectsController/useProjectsRetrieve'
import { useProjectsTransitionsCreate } from '@/shared/api/generated/hooks/projectsController/useProjectsTransitionsCreate'

import { buildTransitionBody } from '../lib/to-transition-body'

export interface StageRecord {
  enteredAt?: string
  enteredBy?: string
  completedAt?: string
  completedBy?: string
  values?: Partial<StageFormData>
}

export type StageRecords = Partial<Record<ProjectStage, StageRecord>>

export interface StageFlow {
  currentStage: ProjectStage
  records: StageRecords
  visibleStages: ProjectStage[]
  isCurrent: (stage: ProjectStage) => boolean
  getRecord: (stage: ProjectStage) => StageRecord | undefined
  advance: (values?: Partial<StageFormData>) => void
  isAdvancing: boolean
  /** Инкрементальная правка полей текущего этапа (для per-row аудита, документов и т.п.). */
  patchCurrentStageValues: (patch: Partial<StageFormData>) => void

  // Финансовые статьи (используются на этапах ready/expenses/bonus_calculated).
  articles: ProjectArticles
  taxRate: number
  updateArticle: (block: ArticleBlock, kind: ArticleKind, patch: Partial<ArticleValues>) => void
  setTaxRate: (rate: number) => void
  toggleBackline: () => void
}

export interface UseStageFlowOptions {
  /** ID проекта из бэка (`Project.id`). Без него `advance()` работает только локально. */
  projectId?: number
  initialStage: ProjectStage
  /** Когда проект попал в воронку (создан в нашей системе после синка PLUM). */
  projectEnteredAt?: string
  /** Название проекта — подставляется в текст уведомлений руководителю. */
  projectTitle?: string
}

const PLUM_SYSTEM_LABEL = 'PLUM (синхронизация)'

/** Этапы с финансовыми блоками — их черновик хранит `articles`/`taxRate`, а не RHF-форму. */
const FINANCE_DRAFT_STAGES: ReadonlySet<ProjectStage> = new Set<ProjectStage>([
  'ready_to_event',
  'expenses_entered',
  'bonus_calculated',
])

export function useStageFlow({
  projectId,
  initialStage,
  projectEnteredAt,
  projectTitle,
}: UseStageFlowOptions): StageFlow {
  const currentUser = useCurrentUser()
  const queryClient = useQueryClient()
  const transitionMutation = useProjectsTransitionsCreate()
  // Черновик с прошлого визита — только свой (по пользователю) и только если этап не сменился.
  const initialDraft = useMemo(() => {
    const draft =
      projectId === undefined ? undefined : stageDraftActions.get(projectId, currentUser.id)
    return draft && draft.stage === initialStage ? draft : undefined
  }, [projectId, initialStage, currentUser.id])

  const [currentStage, setCurrentStage] = useState<ProjectStage>(initialStage)
  const [records, setRecords] = useState<StageRecords>(() => ({
    [initialStage]: {
      enteredAt: projectEnteredAt ?? new Date().toISOString(),
      enteredBy: initialStage === 'plum_request' ? PLUM_SYSTEM_LABEL : undefined,
      values: initialDraft?.values,
    },
  }))
  const [articles, setArticles] = useState<ProjectArticles>(
    () => initialDraft?.articles ?? createInitialArticles(),
  )
  const [taxRate, setTaxRateState] = useState<number>(() => initialDraft?.taxRate ?? 0)

  // Финансы трогали в этой сессии — гейт для сохранения черновика (не на маунте).
  const financeDirtyRef = useRef(false)

  const currentIndex = ALL_STAGE_ORDER.indexOf(currentStage)

  const visibleStages = useMemo(
    () => ALL_STAGE_ORDER.slice(0, currentIndex + 1),
    [currentIndex],
  )

  const isCurrent = useCallback(
    (stage: ProjectStage) => stage === currentStage,
    [currentStage],
  )

  const getRecord = useCallback(
    (stage: ProjectStage) => records[stage],
    [records],
  )

  const applyAdvanceLocally = useCallback(
    (next: ProjectStage, values?: Partial<StageFormData>) => {
      const now = new Date().toISOString()
      setRecords((prev) => ({
        ...prev,
        [currentStage]: {
          ...prev[currentStage],
          // Мержим, а не заменяем: per-row штампы (`patchCurrentStageValues`) и
          // form-values на submit должны соблюдаться оба, не затирая друг друга.
          values: { ...prev[currentStage]?.values, ...values },
          completedAt: now,
          completedBy: currentUser.fullName,
        },
        [next]: {
          ...prev[next],
          enteredAt: now,
          enteredBy: currentUser.fullName,
        },
      }))
      setCurrentStage(next)
      // Этап отправлен — черновик больше не нужен.
      financeDirtyRef.current = false
      if (projectId !== undefined) stageDraftActions.clear(projectId, currentUser.id)

      // Мок: переход на этап, требующий действия роли → уведомление этой роли.
      const stageNotification = getStageNotification(next)
      if (stageNotification) {
        useNotificationStore.getState().push({
          stage: next,
          recipient: stageNotification.recipient,
          channels: stageNotification.channels,
          projectId: projectId ?? 0,
          projectTitle: projectTitle ?? `Проект #${projectId ?? '—'}`,
        })
      }
    },
    [currentStage, currentUser.fullName, currentUser.id, projectId, projectTitle],
  )

  const advance = useCallback(
    (values?: Partial<StageFormData>) => {
      const nextIndex = currentIndex + 1
      const next = ALL_STAGE_ORDER[nextIndex]
      if (!next) return

      if (projectId === undefined) {
        applyAdvanceLocally(next, values)
        return
      }

      const body = buildTransitionBody({
        currentStage,
        nextStage: next,
        values,
        articles,
        taxRate,
      })

      transitionMutation.mutate(
        { id: projectId, data: body },
        {
          onSuccess: () => {
            applyAdvanceLocally(next, values)
            queryClient.invalidateQueries({ queryKey: projectsRetrieveQueryKey(projectId) })
            // List-ключ — префикс с любыми query-параметрами; передаём только url-часть,
            // чтобы матчнулись все варианты (канбан, календарь по разным месяцам).
            queryClient.invalidateQueries({ queryKey: projectsListQueryKey() })
          },
          // Ошибку наверх пробрасываем через mutation.error — UI пока её не показывает,
          // но `isAdvancing` снимет блокировку кнопки, и пользователь сможет ретрайнуть.
        },
      )
    },
    [
      applyAdvanceLocally,
      articles,
      currentIndex,
      currentStage,
      projectId,
      queryClient,
      taxRate,
      transitionMutation,
    ],
  )

  const patchCurrentStageValues = useCallback(
    (patch: Partial<StageFormData>) => {
      setRecords((prev) => ({
        ...prev,
        [currentStage]: {
          ...prev[currentStage],
          values: { ...prev[currentStage]?.values, ...patch },
        },
      }))
    },
    [currentStage],
  )

  const updateArticle = useCallback(
    (block: ArticleBlock, kind: ArticleKind, patch: Partial<ArticleValues>) => {
      financeDirtyRef.current = true
      setArticles((prev) => {
        const target = prev[block]
        if (!target) return prev
        return {
          ...prev,
          [block]: {
            ...target,
            [kind]: { ...target[kind], ...patch },
          },
        }
      })
    },
    [],
  )

  const setTaxRate = useCallback((rate: number) => {
    financeDirtyRef.current = true
    setTaxRateState(Number.isFinite(rate) ? rate : 0)
  }, [])

  const toggleBackline = useCallback(() => {
    financeDirtyRef.current = true
    setArticles((prev) => ({
      ...prev,
      backline: prev.backline ? null : createEmptyBacklineBlock(),
    }))
  }, [])

  // Протухший черновик (этап проекта сменился где-то ещё) — удаляем.
  useEffect(() => {
    if (projectId === undefined) return
    const draft = stageDraftActions.get(projectId, currentUser.id)
    if (draft && draft.stage !== initialStage) {
      stageDraftActions.clear(projectId, currentUser.id)
    }
  }, [projectId, initialStage, currentUser.id])

  // Живое сохранение финансового черновика — при каждом изменении статей/налога.
  // Так черновик переживает и переход по SPA, и перезагрузку страницы (F5).
  useEffect(() => {
    if (projectId === undefined || !financeDirtyRef.current) return
    if (!FINANCE_DRAFT_STAGES.has(currentStage)) return
    stageDraftActions.save(projectId, {
      stage: currentStage,
      authorId: currentUser.id,
      articles,
      taxRate,
      savedAt: new Date().toISOString(),
    })
  }, [articles, taxRate, currentStage, projectId, currentUser.id])

  return {
    currentStage,
    records,
    visibleStages,
    isCurrent,
    getRecord,
    advance,
    isAdvancing: transitionMutation.isPending,
    patchCurrentStageValues,
    articles,
    taxRate,
    updateArticle,
    setTaxRate,
    toggleBackline,
  }
}
