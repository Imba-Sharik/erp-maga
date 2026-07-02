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
} from '@/entities/project-article'
import { pickDocumentStageValues } from '@/entities/project-document'
import { stageDraftActions } from '@/entities/stage-draft'
import { getTransitionErrorMessage, invalidateProjectAfterTransition } from '@/shared/api'
import { projectsListQueryKey } from '@/shared/api/generated/hooks/projectsController/useProjectsList'
import { projectsRetrieveQueryKey } from '@/shared/api/generated/hooks/projectsController/useProjectsRetrieve'
import { useProjectsBacklineCreate } from '@/shared/api/generated/hooks/projectsController/useProjectsBacklineCreate'
import { useProjectsBacklineDestroy } from '@/shared/api/generated/hooks/projectsController/useProjectsBacklineDestroy'
import { useProjectsBonusPartialUpdate } from '@/shared/api/generated/hooks/projectsController/useProjectsBonusPartialUpdate'
import { useProjectsCalculationPartialUpdate } from '@/shared/api/generated/hooks/projectsController/useProjectsCalculationPartialUpdate'
import { useProjectsClientPartialUpdate } from '@/shared/api/generated/hooks/projectsController/useProjectsClientPartialUpdate'
import { useProjectsContractPartialUpdate } from '@/shared/api/generated/hooks/projectsController/useProjectsContractPartialUpdate'
import { useProjectsEventHeldPartialUpdate } from '@/shared/api/generated/hooks/projectsController/useProjectsEventHeldPartialUpdate'
import { useProjectsExpensesPartialUpdate } from '@/shared/api/generated/hooks/projectsController/useProjectsExpensesPartialUpdate'
import { useProjectsPrimaryContactPartialUpdate } from '@/shared/api/generated/hooks/projectsController/useProjectsPrimaryContactPartialUpdate'
import { useProjectsSalesPartialUpdate } from '@/shared/api/generated/hooks/projectsController/useProjectsSalesPartialUpdate'
import { useProjectsTransitionsCreate } from '@/shared/api/generated/hooks/projectsController/useProjectsTransitionsCreate'
import { toast } from '@/shared/ui/toast'

import { buildClientPatchBody, mapClientBlockToFormData } from '../lib/to-client-patch-body'
import { prepareArticlesForStage, prepareTaxRateForStage } from '../lib/prepare-articles-for-stage'
import { STAGE_PATCH_ADAPTERS } from '../lib/stage-patch-registry'
import { buildTransitionBody } from '../lib/to-transition-body'

/**
 * Унифицированная сигнатура `mutate` block-ручек (contract/sales/expenses).
 * У kubb-хуков типы тел/ответов разные, но рантайм-форма совпадает — приводим к ней.
 */
type StagePatchMutateFn = (
  vars: { id: number; data: object },
  options: {
    onSuccess: (response: unknown) => void
    onError: (error: unknown) => void
  },
) => void

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
  /** `null` — менеджер ещё не вводил процент налога вручную. */
  taxRate: number | null
  updateArticle: (block: ArticleBlock, kind: ArticleKind, patch: Partial<ArticleValues>) => void
  setTaxRate: (rate: number | null) => void
  /** Локальный флип бэклайна на ТЕКУЩЕМ этапе — бэк создаёт блок при переходе (transition). */
  toggleBackline: () => void
  /**
   * Добавить/удалить бэклайн на ПРОЙДЕННОМ этапе. Структура бэклайна — отдельный ресурс
   * бэка (POST/DELETE `/backline/`), поэтому правка задним числом требует реального
   * создания блока (иначе PATCH `/sales/` падает с `no_backline`). Промис резолвится
   * на успехе — вызывающий может, например, ре-базировать снапшот отмены.
   */
  addBackline: () => Promise<void>
  removeBackline: () => Promise<void>
  /** Заменить статьи целиком — для отмены инлайн-правки финансового этапа (restore snapshot). */
  replaceArticles: (next: ProjectArticles) => void
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

/**
 * Сидинг снимков этапов из бэкового снапшота: для активного этапа проставляем
 * `enteredAt`/`enteredBy` (приоритет: бэк → PLUM/дата создания для plum_request →
 * текущий пользователь) и мержим несохранённый черновик поверх бэковых значений.
 * Используется и при маунте, и при server-driven смене этапа (откат) — во втором
 * случае `draftValues` не передаём (черновик старого этапа уже невалиден).
 */
function seedRecords(
  initialRecords: StageRecords | undefined,
  stage: ProjectStage,
  currentUserFullName: string,
  projectEnteredAt: string | undefined,
  draftValues: Partial<StageFormData> | undefined,
): StageRecords {
  const seeded: StageRecords = { ...initialRecords }
  const current = seeded[stage]
  const seededEnteredAt =
    current?.enteredAt ??
    (stage === 'plum_request' ? projectEnteredAt : undefined) ??
    new Date().toISOString()
  const seededEnteredBy =
    current?.enteredBy ?? (stage === 'plum_request' ? PLUM_SYSTEM_LABEL : currentUserFullName)
  seeded[stage] = {
    ...current,
    enteredAt: seededEnteredAt,
    enteredBy: seededEnteredBy,
    values: mergeDraftValues(current?.values, draftValues),
  }
  return seeded
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
  const clientPatchMutation = useProjectsClientPartialUpdate()
  const salesPatchMutation = useProjectsSalesPartialUpdate()
  const expensesPatchMutation = useProjectsExpensesPartialUpdate()
  const primaryContactPatchMutation = useProjectsPrimaryContactPartialUpdate()
  const calculationPatchMutation = useProjectsCalculationPartialUpdate()
  const eventHeldPatchMutation = useProjectsEventHeldPartialUpdate()
  const bonusPatchMutation = useProjectsBonusPartialUpdate()
  const backlineCreateMutation = useProjectsBacklineCreate()
  const backlineDestroyMutation = useProjectsBacklineDestroy()
  // Черновик с прошлого визита — только свой (по пользователю) и только если этап не сменился.
  const initialDraft = useMemo(() => {
    const draft =
      projectId === undefined ? undefined : stageDraftActions.get(projectId, currentUser.id)
    return draft && draft.stage === initialStage ? draft : undefined
  }, [projectId, initialStage, currentUser.id])

  const [currentStage, setCurrentStage] = useState<ProjectStage>(initialStage)
  const [records, setRecords] = useState<StageRecords>(() =>
    // Гидрация пройденных этапов снимками с бэка + запись текущего этапа; черновик
    // перебивает бэковые значения (несохранённая правка текущего этапа).
    seedRecords(
      initialRecords,
      initialStage,
      currentUser.fullName,
      projectEnteredAt,
      initialDraft?.values,
    ),
  )
  const [articles, setArticles] = useState<ProjectArticles>(() => {
    const base = initialDraft?.articles ?? initialArticles ?? createInitialArticles()
    return prepareArticlesForStage(base, initialStage)
  })
  const [taxRate, setTaxRateState] = useState<number | null>(() => {
    // Черновик — это точное состояние ввода пользователя (включая явный `null`),
    // поэтому при его наличии не нормализуем. Бэковое значение приводим к `null`,
    // если это незаполненный `0` на этапе ready_to_event.
    if (initialDraft) return initialDraft.taxRate ?? null
    return prepareTaxRateForStage(initialTaxRate ?? null, initialStage)
  })

  // Финансы трогали в этой сессии — гейт для сохранения черновика (не на маунте).
  const financeDirtyRef = useRef(false)
  // Синхронный гейт от дабл-кликов: `isPending` — снимок прошлого рендера и не успевает
  // обновиться между двумя кликами в одном тике, поэтому держим флаг в ref.
  const advancingRef = useRef(false)

  const currentIndex = ALL_STAGE_ORDER.indexOf(currentStage)

  const visibleStages = useMemo(() => ALL_STAGE_ORDER.slice(0, currentIndex + 1), [currentIndex])

  const isCurrent = useCallback((stage: ProjectStage) => stage === currentStage, [currentStage])

  // Сервер может сменить этап в обход локального flow — откат на предыдущий этап
  // (отдельный эндпоинт пишет свежий ProjectDetail в кэш, но не зовёт applyAdvanceLocally)
  // или внешнее изменение. Подхватываем серверный этап И регидрируем финансы/records из
  // свежего снапшота: `useStageFlow` не пересоздаётся при откате (key=projectId, не этап),
  // поэтому без этого в стейте остались бы локальные значения старого этапа (бонусы, налог,
  // формы). Свой advance сюда не попадает: там к приходу свежих данных currentStage уже
  // равен новому initialStage (setQueryData + applyAdvanceLocally батчатся) — условие ложно.
  useEffect(() => {
    if (initialStage === currentStage) return
    setCurrentStage(initialStage)
    setArticles(prepareArticlesForStage(initialArticles ?? createInitialArticles(), initialStage))
    setTaxRateState(prepareTaxRateForStage(initialTaxRate ?? null, initialStage))
    setRecords(
      seedRecords(initialRecords, initialStage, currentUser.fullName, projectEnteredAt, undefined),
    )
    financeDirtyRef.current = false
  }, [
    initialStage,
    currentStage,
    initialArticles,
    initialTaxRate,
    initialRecords,
    currentUser.fullName,
    projectEnteredAt,
  ])

  const getRecord = useCallback((stage: ProjectStage) => records[stage], [records])

  const applyAdvanceLocally = useCallback(
    (next: ProjectStage, values?: Partial<StageFormData>) => {
      const now = new Date().toISOString()
      setRecords((prev) => {
        const completedValues: Partial<StageFormData> = {
          ...prev[currentStage]?.values,
          ...values,
        }
        if (currentStage === 'data_confirmed' && values?.dataConfirmedStatus) {
          completedValues.dataConfirmedBy = currentUser.fullName
          completedValues.dataConfirmedAt = now
        }

        return {
          ...prev,
          [currentStage]: {
            ...prev[currentStage],
            // Мержим, а не заменяем: per-row штампы (`patchCurrentStageValues`) и
            // form-values на submit должны соблюдаться оба, не затирая друг друга.
            values: completedValues,
            completedAt: now,
            completedBy: currentUser.fullName,
          },
          [next]: {
            ...prev[next],
            enteredAt: now,
            enteredBy: currentUser.fullName,
          },
        }
      })
      setCurrentStage(next)
      // Вход в финансовый этап внутри SPA (без перезагрузки): прежние/бэковые нули
      // в редактируемом аспекте трактуем как «ещё не вводили» — так же, как при маунте.
      setArticles((prev) => prepareArticlesForStage(prev, next))
      setTaxRateState((prev) => prepareTaxRateForStage(prev, next))
      // Этап отправлен — черновик больше не нужен.
      financeDirtyRef.current = false
      if (projectId !== undefined) stageDraftActions.clear(projectId, currentUser.id)
    },
    [currentStage, currentUser.fullName, currentUser.id, projectId],
  )

  const advance = useCallback(
    (values?: Partial<StageFormData>) => {
      // Защита от повторных кликов: пока идёт переход, новый запрос не шлём.
      if (transitionMutation.isPending || advancingRef.current) return
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

      // «Не приняты» на data_confirmed — бэк это no-op (этап остаётся data_confirmed).
      // Оптимистично НЕ двигаем, иначе локально проштампуем data_confirmed завершённым и
      // заведём фантомный bonus_calculated; полагаемся на серверный ProjectDetail.
      const isNoopReject =
        currentStage === 'data_confirmed' && values?.dataConfirmedStatus === 'rejected'

      advancingRef.current = true
      transitionMutation.mutate(
        { id: projectId, data: body },
        {
          onSuccess: (detail) => {
            // Сервер — источник правды о результирующем этапе (как в use-rollback-stage):
            // пишем свежий ProjectDetail в кэш, а sync-эффект подхватывает реальный этап.
            queryClient.setQueryData(projectsRetrieveQueryKey(projectId), detail)
            if (!isNoopReject) applyAdvanceLocally(next, values)
            invalidateProjectAfterTransition(queryClient, projectId)
            void queryClient.invalidateQueries({ queryKey: notificationsListQueryKey() })
          },
          onError: (error) => {
            toast.error(getTransitionErrorMessage(error, 'Не удалось перейти на следующий этап'))
          },
          onSettled: () => {
            advancingRef.current = false
          },
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

      if (currentStage !== 'plum_request' || projectId === undefined || !('magComment' in patch)) {
        return
      }

      const data = buildClientPatchBody(patch)
      if (Object.keys(data).length === 0) return

      clientPatchMutation.mutate(
        { id: projectId, data },
        {
          onSuccess: (block) => {
            const synced = mapClientBlockToFormData(block)
            setRecords((prev) => ({
              ...prev,
              [currentStage]: {
                ...prev[currentStage],
                values: { ...prev[currentStage]?.values, ...synced },
              },
            }))
            queryClient.invalidateQueries({ queryKey: projectsRetrieveQueryKey(projectId) })
            queryClient.invalidateQueries({ queryKey: projectsListQueryKey() })
          },
        },
      )
    },
    [clientPatchMutation, currentStage, projectId, queryClient],
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
      const adapter = STAGE_PATCH_ADAPTERS[stage]
      // Этап без серверного маршрута (или нет projectId) — правим только локально:
      // дозаполнение пропущенного этапа и этапы, чьи ручки ещё не готовы у бэка.
      if (!adapter || projectId === undefined) {
        applyStageValuesLocally(stage, values)
        return
      }

      // Финансовые этапы кладут правки в общий `articles` ещё до Save, поэтому
      // оптимистичный apply form-значений безвреден (values там пустой).
      applyStageValuesLocally(stage, values)

      const body = adapter.buildBody({ values, articles, taxRate })
      if (!body || Object.keys(body).length === 0) return

      const mutation =
        stage === 'plum_request'
          ? clientPatchMutation
          : stage === 'primary_contact_done'
            ? primaryContactPatchMutation
            : stage === 'calculation_prepared'
              ? calculationPatchMutation
              : stage === 'contract_signed'
                ? contractPatchMutation
                : stage === 'ready_to_event'
                  ? salesPatchMutation
                  : stage === 'expenses_entered'
                    ? expensesPatchMutation
                    : stage === 'event_held'
                      ? eventHeldPatchMutation
                      : stage === 'bonus_calculated'
                        ? bonusPatchMutation
                        : undefined
      if (!mutation) return
      ;(mutation.mutate as unknown as StagePatchMutateFn)(
        { id: projectId, data: body },
        {
          onSuccess: (response) => {
            // Мгновенный апдейт формы только для block-схем (contract). Финансы
            // (sales/expenses) пересчитывает бэк — полагаемся на invalidate+refetch.
            if (adapter.mapResponse) {
              applyStageValuesLocally(stage, { ...values, ...adapter.mapResponse(response) })
            }
            // Полная инвалидация проекта: пересчёт итогов/прибыли/бонуса на поздних
            // этапах, обновление aside «Финансы» и аудит-лог правки руководителя.
            invalidateProjectAfterTransition(queryClient, projectId)
            void queryClient.invalidateQueries({ queryKey: notificationsListQueryKey() })
          },
          onError: (error) => {
            toast.error(getTransitionErrorMessage(error, 'Не удалось сохранить изменения этапа'))
          },
        },
      )
    },
    [
      applyStageValuesLocally,
      articles,
      taxRate,
      projectId,
      queryClient,
      clientPatchMutation,
      contractPatchMutation,
      salesPatchMutation,
      expensesPatchMutation,
      primaryContactPatchMutation,
      calculationPatchMutation,
      eventHeldPatchMutation,
      bonusPatchMutation,
    ],
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

  const setTaxRate = useCallback((rate: number | null) => {
    financeDirtyRef.current = true
    setTaxRateState(rate === null || Number.isFinite(rate) ? rate : null)
  }, [])

  const toggleBackline = useCallback(() => {
    financeDirtyRef.current = true
    setArticles((prev) => ({
      ...prev,
      backline: prev.backline ? null : createEmptyBacklineBlock(),
    }))
  }, [])

  // Правка задним числом: бэклайн — отдельный ресурс, POST/DELETE `/backline/`. Бэк
  // создаёт/удаляет пару блоков (sales + expense); на успехе оптимистично флипаем
  // локальные статьи и инвалидируем проект. Без projectId — только локальный флип.
  const addBackline = useCallback((): Promise<void> => {
    if (projectId === undefined) {
      setArticles((prev) =>
        prev.backline ? prev : { ...prev, backline: createEmptyBacklineBlock() },
      )
      return Promise.resolve()
    }
    return backlineCreateMutation
      .mutateAsync({ id: projectId, data: { id: projectId } })
      .then(() => {
        setArticles((prev) =>
          prev.backline ? prev : { ...prev, backline: createEmptyBacklineBlock() },
        )
        invalidateProjectAfterTransition(queryClient, projectId)
      })
      .catch((error: unknown) => {
        toast.error(getTransitionErrorMessage(error, 'Не удалось добавить бэклайн'))
        throw error
      })
  }, [projectId, queryClient, backlineCreateMutation])

  const removeBackline = useCallback((): Promise<void> => {
    if (projectId === undefined) {
      setArticles((prev) => (prev.backline ? { ...prev, backline: null } : prev))
      return Promise.resolve()
    }
    return backlineDestroyMutation
      .mutateAsync({ id: projectId })
      .then(() => {
        setArticles((prev) => ({ ...prev, backline: null }))
        invalidateProjectAfterTransition(queryClient, projectId)
      })
      .catch((error: unknown) => {
        toast.error(getTransitionErrorMessage(error, 'Не удалось удалить бэклайн'))
        throw error
      })
  }, [projectId, queryClient, backlineDestroyMutation])

  const replaceArticles = useCallback((next: ProjectArticles) => {
    financeDirtyRef.current = true
    setArticles(next)
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
      highlightPending: false,
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
    addBackline,
    removeBackline,
    replaceArticles,
  }
}
