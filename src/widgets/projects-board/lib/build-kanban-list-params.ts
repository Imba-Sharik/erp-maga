import { plumEventStatusFilterParam } from '@/entities/project'

import type { BoardListParams } from './kanban-board-query'

type KanbanListDateParams = Pick<
  BoardListParams,
  'event_date_after' | 'event_date_before' | 'ordering'
>

interface BuildKanbanListParamsInput {
  search: string
  plumEventStatus: string | null
  hall_id?: number
  loft_id?: number
  /** Plum ID города (`city` в `/projects/`); `null` — фильтр не задан. */
  city?: string | null
}

export function buildKanbanListParams(
  base: KanbanListDateParams,
  { search, plumEventStatus, hall_id, loft_id, city }: BuildKanbanListParamsInput,
): BoardListParams {
  const plum_event_status = plumEventStatusFilterParam(plumEventStatus)
  const trimmedSearch = search.trim() || undefined

  return {
    ...base,
    ...(trimmedSearch ? { search: trimmedSearch } : {}),
    ...(plum_event_status !== undefined ? { plum_event_status } : {}),
    ...(hall_id !== undefined ? { hall_id } : {}),
    ...(loft_id !== undefined ? { loft_id } : {}),
    ...(city ? { city } : {}),
  }
}
