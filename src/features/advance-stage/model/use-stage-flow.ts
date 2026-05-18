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

  // Финансовые статьи (используются на этапах ready/expenses/bonus_calculated).
  articles: ProjectArticles
  taxRate: number
  updateArticle: (block: ArticleBlock, kind: ArticleKind, patch: Partial<ArticleValues>) => void
  setTaxRate: (rate: number) => void
  toggleBackline: () => void
}

export interface UseStageFlowOptions {
  initialStage: ProjectStage
  /** Когда проект попал в воронку (создан в нашей системе после синка PLUM). */
  projectEnteredAt?: string
}

const PLUM_SYSTEM_LABEL = 'PLUM (синхронизация)'

export function useStageFlow({
  initialStage,
  projectEnteredAt,
}: UseStageFlowOptions): StageFlow {
  const currentUser = useCurrentUser()
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

  // DEMO: показываем сразу все 12 этапов для показа продакту.
  // Вернуть `ALL_STAGE_ORDER.slice(0, currentIndex + 1)` после демо.
  const visibleStages = useMemo(() => [...ALL_STAGE_ORDER], [])

  const isCurrent = useCallback(
    (stage: ProjectStage) => stage === currentStage,
    [currentStage],
  )

  const getRecord = useCallback(
    (stage: ProjectStage) => records[stage],
    [records],
  )

  const advance = useCallback(
    (values?: Partial<StageFormData>) => {
      const nextIndex = currentIndex + 1
      const next = ALL_STAGE_ORDER[nextIndex]
      if (!next) return

      const now = new Date().toISOString()
      setRecords((prev) => ({
        ...prev,
        [currentStage]: {
          ...prev[currentStage],
          values: values ?? prev[currentStage]?.values ?? {},
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
    [currentStage, currentIndex, currentUser.fullName],
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
    articles,
    taxRate,
    updateArticle,
    setTaxRate,
    toggleBackline,
  }
}
