import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'

import { mapBackendProjects, plumEventStatusFilterQueryParams } from '@/entities/project'
import {
  buildOpenRequestsQueryParams,
  type AccountantRequestsStageParams,
} from '@/features/accountant-requests'
import { projectsList } from '@/shared/api/generated/clients/projectsController/projectsList'
import { PROJECTS_LIST_DEFAULT_ORDERING } from '@/shared/constants/projects-list-ordering'

const PAGE_SIZE = 50

export type RequestsTableVariant = 'open' | 'closed'

/** Закрытые запросы — этапы после подтверждения документов (бухгалтер уже отработал). */
const CLOSED_STAGE_IN = [
  'feedback_received',
  'data_confirmed',
  'bonus_calculated',
  'bonus_approved',
  'closed',
  'archived',
].join(',')

/**
 * Запросы бухгалтера. Этап — всегда параметр запроса:
 * - `open` → `buildOpenRequestsQueryParams()` (ждут подтверждения);
 * - `closed` → `stage__in=<этапы после подтверждения>`.
 */
export function useRequestsTableQuery(
  variant: RequestsTableVariant,
  search?: string,
  plumEventStatus: string[] = [],
) {
  const stageParams: AccountantRequestsStageParams =
    variant === 'open' ? buildOpenRequestsQueryParams() : { stage__in: CLOSED_STAGE_IN }

  const trimmedSearch = search?.trim() || undefined
  const plumStatusParams = plumEventStatusFilterQueryParams(plumEventStatus)

  const query = useInfiniteQuery({
    queryKey: [
      'requests-table',
      { variant, ...stageParams, search: trimmedSearch, ...plumStatusParams },
    ] as const,
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      projectsList(
        {
          ...stageParams,
          ordering: PROJECTS_LIST_DEFAULT_ORDERING,
          limit: PAGE_SIZE,
          offset: pageParam,
          ...plumStatusParams,
          ...(trimmedSearch ? { search: trimmedSearch } : {}),
        },
        { signal },
      ),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length * PAGE_SIZE : undefined,
  })

  const projects = useMemo(() => {
    const raw = query.data?.pages.flatMap((p) => p.results) ?? []
    return mapBackendProjects(raw)
  }, [query.data])

  return {
    projects,
    totalCount: query.data?.pages[0]?.count,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isLoading: query.isLoading,
    isError: query.isError,
    isFetchingNextPage: query.isFetchingNextPage,
  }
}
