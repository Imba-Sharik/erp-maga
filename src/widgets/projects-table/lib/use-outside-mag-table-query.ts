import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'

import { mapBackendOutOfMagProjects, plumEventStatusFilterQueryParams } from '@/entities/project'
import { projectsOutOfMagList } from '@/shared/api/generated/clients/projectsController/projectsOutOfMagList'
import type { ProjectsOutOfMagListQueryParams } from '@/shared/api/generated/types/projectsController/ProjectsOutOfMagList'
import { PROJECTS_LIST_DEFAULT_ORDERING } from '@/shared/constants/projects-list-ordering'

const PAGE_SIZE = 50

export type OutsideMagTableListParams = Pick<
  ProjectsOutOfMagListQueryParams,
  'event_date_after' | 'event_date_before' | 'ordering' | 'search' | 'hall_id' | 'loft_id'
>

interface UseOutsideMagTableQueryOptions {
  enabled?: boolean
}

function parseMagManagerId(magManagerId: string | null): number | undefined {
  if (!magManagerId) return undefined
  const id = Number(magManagerId)
  return Number.isFinite(id) ? id : undefined
}

export function useOutsideMagTableQuery(
  listParams: OutsideMagTableListParams,
  magManagerId: string | null,
  plumEventStatus: string[] = [],
  { enabled = true }: UseOutsideMagTableQueryOptions = {},
) {
  const mag_manager = parseMagManagerId(magManagerId)
  const plumStatusParams = plumEventStatusFilterQueryParams(plumEventStatus)

  const query = useInfiniteQuery({
    queryKey: [
      'projects-out-of-mag-table',
      {
        ...listParams,
        ordering: listParams.ordering ?? PROJECTS_LIST_DEFAULT_ORDERING,
        mag_manager,
        ...plumStatusParams,
      },
    ] as const,
    enabled,
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      projectsOutOfMagList(
        {
          ...listParams,
          ordering: listParams.ordering ?? PROJECTS_LIST_DEFAULT_ORDERING,
          limit: PAGE_SIZE,
          offset: pageParam,
          ...(mag_manager !== undefined ? { mag_manager } : {}),
          ...plumStatusParams,
        },
        { signal },
      ),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length * PAGE_SIZE : undefined,
  })

  const projects = useMemo(() => {
    const raw = query.data?.pages.flatMap((page) => page.results) ?? []
    return mapBackendOutOfMagProjects(raw)
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
