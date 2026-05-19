import { useCallback, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import type { Project as ApiProject } from '@/shared/api/generated/types/Project'
import type { StageEnum } from '@/shared/api/generated/types/StageEnum'
import { invalidateKanbanBoardQueries } from '@/widgets/projects-board/lib/kanban-board-query'
import {
  moveProjectInKanbanCache,
  restoreKanbanCaches,
  snapshotKanbanCaches,
  type KanbanCacheSnapshot,
} from '@/widgets/projects-board/lib/kanban-projects-cache'

export interface OptimisticKanbanStageMoveInput {
  /** Проект с уже обновлённым `stage` (= `toApiStage`). */
  project: ApiProject
  fromApiStage: StageEnum
  toApiStage: StageEnum
}

/**
 * Оптимистичное перемещение карточки между колонками канбана в React Query кэше.
 *
 * @example
 * ```ts
 * const kanban = useOptimisticKanbanStageUpdate()
 *
 * mutation.mutate(payload, {
 *   onMutate: () => {
 *     const snapshot = kanban.applyMove({
 *       project: { ...current, stage: toApiStage },
 *       fromApiStage,
 *       toApiStage,
 *     })
 *     return { snapshot }
 *   },
 *   onError: (_e, _v, ctx) => kanban.rollback(ctx.snapshot),
 *   onSettled: () => kanban.invalidateBoard(),
 * })
 * ```
 *
 * Toolbar-фильтры (search/city/hall/loft) применяются при рендере колонки —
 * патчится сырой список, видимость карточки пересчитывается автоматически.
 *
 * Для API-стадии `feedback_received` используйте `toApiStage: 'data_confirmed'`.
 */
export function useOptimisticKanbanStageUpdate() {
  const queryClient = useQueryClient()

  const applyMove = useCallback(
    (input: OptimisticKanbanStageMoveInput): KanbanCacheSnapshot => {
      const snapshot = snapshotKanbanCaches(queryClient)
      moveProjectInKanbanCache(queryClient, input)
      return snapshot
    },
    [queryClient],
  )

  const rollback = useCallback(
    (snapshot: KanbanCacheSnapshot) => {
      restoreKanbanCaches(queryClient, snapshot)
    },
    [queryClient],
  )

  const invalidateBoard = useCallback(() => {
    invalidateKanbanBoardQueries(queryClient)
  }, [queryClient])

  return useMemo(
    () => ({ applyMove, rollback, invalidateBoard }),
    [applyMove, rollback, invalidateBoard],
  )
}
