import { plumEventStatusFilterQueryParams } from '@/entities/project'

import type { BoardListParams } from './kanban-board-query'

type KanbanListDateParams = Pick<
  BoardListParams,
  'event_date_after' | 'event_date_before' | 'ordering'
>

interface BuildKanbanListParamsInput {
  search: string
  plumEventStatus: string[]
  hall_id?: number
  loft_id?: number
  /** Plum ID города (`city` в `/projects/`); `null` — фильтр не задан. */
  city?: string | null
}

export function buildKanbanListParams(
  base: KanbanListDateParams,
  { search, plumEventStatus, hall_id, loft_id, city }: BuildKanbanListParamsInput,
): BoardListParams {
  const trimmedSearch = search.trim() || undefined

  return {
    ...base,
    ...(trimmedSearch ? { search: trimmedSearch } : {}),
    ...plumEventStatusFilterQueryParams(plumEventStatus),
    ...(hall_id !== undefined ? { hall_id } : {}),
    ...(loft_id !== undefined ? { loft_id } : {}),
    ...(city ? { city } : {}),
  }
}
