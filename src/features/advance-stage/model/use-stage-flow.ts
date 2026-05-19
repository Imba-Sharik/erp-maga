import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'

import { useCurrentUser } from '@/entities/current-user'
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
}

const PLUM_SYSTEM_LABEL = 'PLUM (синхронизация)'

export function useStageFlow({
  projectId,
  initialStage,
  projectEnteredAt,
}: UseStageFlowOptions): StageFlow {
  const currentUser = useCurrentUser()
  const queryClient = useQueryClient()
  const transitionMutation = useProjectsTransitionsCreate()
  const [currentStage, setCurrentStage] = useState<ProjectStage>(initialStage)
  const [records, setRecords] = useState<StageRecords>(() => ({
    [initialStage]: {
      enteredAt: projectEnteredAt ?? new Date().toISOString(),
      enteredBy: initialStage === 'plum_request' ? PLUM_SYSTEM_LABEL : undefined,
    },
  }))
  const [articles, setArticles] = useState<ProjectArticles>(() => createInitialArticles())
  const [taxRate, setTaxRateState] = useState<number>(0)

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
    },
    [currentStage, currentUser.fullName],
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
    setTaxRateState(Number.isFinite(rate) ? rate : 0)
  }, [])

  const toggleBackline = useCallback(() => {
    setArticles((prev) => ({
      ...prev,
      backline: prev.backline ? null : createEmptyBacklineBlock(),
    }))
  }, [])

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
