import { plumEventStatusFilterParam } from '@/entities/project'

import type { BoardListParams } from './kanban-board-query'

type KanbanListDateParams = Pick<
  BoardListParams,
  'event_date_after' | 'event_date_before' | 'ordering'
>

interface BuildKanbanListParamsInput {
  search: string
  plumEventStatus: string | null
}

export function buildKanbanListParams(
  base: KanbanListDateParams,
  { search, plumEventStatus }: BuildKanbanListParamsInput,
): BoardListParams {
  const plum_event_status = plumEventStatusFilterParam(plumEventStatus)
  const trimmedSearch = search.trim() || undefined

  return {
    ...base,
    ...(trimmedSearch ? { search: trimmedSearch } : {}),
    ...(plum_event_status !== undefined ? { plum_event_status } : {}),
  }
}
