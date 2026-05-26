import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useCurrentUser } from '@/entities/current-user'
import { notificationsListQueryKey } from '@/entities/notification'
import { ALL_STAGE_ORDER, type ProjectStage, type StageFormData } from '@/entities/project'
import {
  createEmptyBacklineBlock,
  createInitialArticles,
  type ArticleBlock,
  type ArticleKind,
  type ArticleValues,
  type ProjectArticles,
} from '@/entities/project-articles'
import { pickDocumentStageValues } from '@/entities/project-documents'
import { stageDraftActions } from '@/entities/stage-draft'
import { projectsListQueryKey } from '@/shared/api/generated/hooks/projectsController/useProjectsList'
import { projectsRetrieveQueryKey } from '@/shared/api/generated/hooks/projectsController/useProjectsRetrieve'
import { useProjectsContractPartialUpdate } from '@/shared/api/generated/hooks/projectsController/useProjectsContractPartialUpdate'
import { useProjectsTransitionsCreate } from '@/shared/api/generated/hooks/projectsController/useProjectsTransitionsCreate'

import { buildContractPatchBody, mapContractBlockToFormData } from '../lib/to-contract-patch-body'
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
  /**
   * Точечно поправить поля прошлого/пропущенного этапа. Для текущего этапа
   * используйте `patchCurrentStageValues`.
   */
  patchStageValues: (stage: ProjectStage, values: Partial<StageFormData>) => void

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
  /** Снимки пройденных этапов с бэка — гидрируют `records`, чтобы данные пережили перезагрузку. */
  initialRecords?: StageRecords
  /** Финансовые статьи проекта с бэка — гидрируют `articles` (этапы ready/expenses/bonus). */
  initialArticles?: ProjectArticles
  /** Процент налога с бэка — гидрирует `taxRate`. */
  initialTaxRate?: number
}

const PLUM_SYSTEM_LABEL = 'PLUM (синхронизация)'

/** Audit-поля документов приходят с бэка; пустой localStorage-черновик не должен их затирать. */
function isDocumentAuditField(key: string): boolean {
  return key.endsWith('ConfirmedAt') || key.endsWith('ConfirmedBy')
}

function mergeDraftValues(
  backend: Partial<StageFormData> | undefined,
  draft: Partial<StageFormData> | undefined,
): Partial<StageFormData> {
  if (!draft) return backend ?? {}
  const merged: Partial<StageFormData> = { ...backend }
  for (const [key, value] of Object.entries(draft) as [keyof StageFormData, unknown][]) {
    if (value === undefined || value === null) continue
    const backendValue = backend?.[key]
    if (isDocumentAuditField(String(key)) && !value) continue
    if (value === '' && backendValue) continue
    merged[key] = value as never
  }
  return merged
}

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
  initialRecords,
  initialArticles,
  initialTaxRate,
}: UseStageFlowOptions): StageFlow {
  const currentUser = useCurrentUser()
  const queryClient = useQueryClient()
  const transitionMutation = useProjectsTransitionsCreate()
  const contractPatchMutation = useProjectsContractPartialUpdate()
  // Черновик с прошлого визита — только свой (по пользователю) и только если этап не сменился.
  const initialDraft = useMemo(() => {
    const draft =
      projectId === undefined ? undefined : stageDraftActions.get(projectId, currentUser.id)
    return draft && draft.stage === initialStage ? draft : undefined
  }, [projectId, initialStage, currentUser.id])

  const [currentStage, setCurrentStage] = useState<ProjectStage>(initialStage)
  const [records, setRecords] = useState<StageRecords>(() => {
    // Гидрация пройденных этапов снимками с бэка + запись текущего этапа.
    const seeded: StageRecords = { ...initialRecords }
    const current = seeded[initialStage]
    // Приоритет: значение с бэка (`current?.enteredAt`) → дата создания проекта для
    // plum_request → момент маунта. Для не-plum «дата создания проекта» бессмысленна,
    // поэтому пропускаем и сразу падаем в now (= когда пользователь сюда зашёл).
    const seededEnteredAt =
      current?.enteredAt ??
      (initialStage === 'plum_request' ? projectEnteredAt : undefined) ??
      new Date().toISOString()
    // Аналогично для автора: бэк → PLUM (для plum_request) → текущий пользователь.
    // Подменяем на viewer, чтобы поле «Статус перевёл менеджер» сразу было заполнено,
    // когда бэк не вернул `*_set_by` для текущего этапа.
    const seededEnteredBy =
      current?.enteredBy ??
      (initialStage === 'plum_request' ? PLUM_SYSTEM_LABEL : currentUser.fullName)
    seeded[initialStage] = {
      ...current,
      enteredAt: seededEnteredAt,
      enteredBy: seededEnteredBy,
      // Черновик перебивает значения с бэка — несохранённая правка текущего этапа.
      values: mergeDraftValues(current?.values, initialDraft?.values),
    }
    return seeded
  })
  const [articles, setArticles] = useState<ProjectArticles>(
    () => initialDraft?.articles ?? initialArticles ?? createInitialArticles(),
  )
  const [taxRate, setTaxRateState] = useState<number>(
    () => initialDraft?.taxRate ?? initialTaxRate ?? 0,
  )

  // Финансы трогали в этой сессии — гейт для сохранения черновика (не на маунте).
  const financeDirtyRef = useRef(false)

  const currentIndex = ALL_STAGE_ORDER.indexOf(currentStage)

  const visibleStages = useMemo(() => ALL_STAGE_ORDER.slice(0, currentIndex + 1), [currentIndex])

  const isCurrent = useCallback((stage: ProjectStage) => stage === currentStage, [currentStage])

  const getRecord = useCallback((stage: ProjectStage) => records[stage], [records])

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
    },
    [currentStage, currentUser.fullName, currentUser.id, projectId],
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
            void queryClient.invalidateQueries({ queryKey: notificationsListQueryKey() })
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

  const applyStageValuesLocally = useCallback(
    (stage: ProjectStage, values: Partial<StageFormData>) => {
      setRecords((prev) => ({
        ...prev,
        [stage]: {
          ...prev[stage],
          values: { ...prev[stage]?.values, ...values },
        },
      }))
    },
    [],
  )

  const patchStageValues = useCallback(
    (stage: ProjectStage, values: Partial<StageFormData>) => {
      if (stage !== 'contract_signed') {
        applyStageValuesLocally(stage, values)
        return
      }

      if (projectId === undefined) {
        applyStageValuesLocally(stage, values)
        return
      }

      const data = buildContractPatchBody(values)
      contractPatchMutation.mutate(
        { id: projectId, data },
        {
          onSuccess: (block) => {
            const synced = mapContractBlockToFormData(block)
            applyStageValuesLocally(stage, { ...values, ...synced })
            queryClient.invalidateQueries({ queryKey: projectsRetrieveQueryKey(projectId) })
            queryClient.invalidateQueries({ queryKey: projectsListQueryKey() })
            void queryClient.invalidateQueries({ queryKey: notificationsListQueryKey() })
          },
        },
      )
    },
    [applyStageValuesLocally, contractPatchMutation, projectId, queryClient],
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

  // После PATCH документов / refetch GET — подтягиваем статус и аудит с бэка в локальный flow.
  useEffect(() => {
    const backendSnap = initialRecords?.documents_confirmed
    if (!backendSnap?.values) return
    const fromBackend = pickDocumentStageValues(backendSnap.values)
    if (Object.keys(fromBackend).length === 0) return

    setRecords((prev) => {
      const prevValues = prev.documents_confirmed?.values ?? {}
      const mergedValues = { ...prevValues, ...fromBackend }
      const changed = (Object.keys(fromBackend) as (keyof StageFormData)[]).some(
        (key) => prevValues[key] !== mergedValues[key],
      )
      if (!changed) return prev
      return {
        ...prev,
        documents_confirmed: {
          ...prev.documents_confirmed,
          ...backendSnap,
          values: mergedValues,
        },
      }
    })
  }, [initialRecords?.documents_confirmed])

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
    patchStageValues,
    articles,
    taxRate,
    updateArticle,
    setTaxRate,
    toggleBackline,
  }
}
