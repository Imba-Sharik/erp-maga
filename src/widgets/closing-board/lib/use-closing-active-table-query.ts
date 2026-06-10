import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'

import {
  CLOSING_STAGE_ORDER,
  closingStageToApi,
  mapBackendProjects,
  plumEventStatusFilterParam,
  type Project,
} from '@/entities/project'
import { projectsList } from '@/shared/api/generated/clients/projectsController/projectsList'
import type { BoardListParams } from '@/widgets/projects-board/lib/kanban-board-query'

const PAGE_SIZE = 50

/**
 * Все этапы закрывающей воронки одной строкой для `stage__in`.
 * Через `closingStageToApi`, а не сырые ключи — correct-by-construction:
 * если API-ключи разойдутся с фронтовыми, маппинг это учтёт (как в канбане).
 */
const CLOSING_STAGE_IN = CLOSING_STAGE_ORDER.map(closingStageToApi).join(',')

export interface UseClosingActiveTableQueryResult {
  projects: Project[]
  isLoading: boolean
  isError: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
}

/**
 * Плоский список проектов закрывающей воронки — для табличного представления
 * канбана «Закрытие». Один запрос с `stage__in` вместо колоночных запросов
 * канбана. Те же `listParams` (event_date_after = сегодня, ordering, search),
 * фасетный фильтр «город» применяется на клиенте.
 */
export function useClosingActiveTableQuery({
  listParams,
  plumEventStatus = null,
  enabled = true,
}: {
  listParams: BoardListParams
  plumEventStatus?: string | null
  enabled?: boolean
}): UseClosingActiveTableQueryResult {
  const plum_event_status = plumEventStatusFilterParam(plumEventStatus)

  const query = useInfiniteQuery({
    queryKey: [
      'projects-closing-active-table',
      { ...listParams, stage__in: CLOSING_STAGE_IN, plum_event_status },
    ],
    enabled,
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      projectsList(
        {
          ...listParams,
          stage__in: CLOSING_STAGE_IN,
          limit: PAGE_SIZE,
          offset: pageParam,
          ...(plum_event_status !== undefined ? { plum_event_status } : {}),
        },
        { signal },
      ),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length * PAGE_SIZE : undefined,
  })

  const projects = useMemo(
    () => mapBackendProjects(query.data?.pages.flatMap((p) => p.results) ?? []),
    [query.data],
  )

  return {
    projects,
    isLoading: query.isLoading,
    isError: query.isError,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: () => query.fetchNextPage(),
  }
}
