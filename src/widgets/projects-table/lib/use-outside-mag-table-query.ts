import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'

import { mapBackendProjects } from '@/entities/project'
import { projectsList } from '@/shared/api/generated/clients/projectsController/projectsList'
import type { ProjectsListQueryParams } from '@/shared/api/generated/types/projectsController/ProjectsList'
import { PROJECTS_LIST_DEFAULT_ORDERING } from '@/shared/constants/projects-list-ordering'

const PAGE_SIZE = 50

export type OutsideMagTableListParams = Pick<
  ProjectsListQueryParams,
  'event_date_after' | 'event_date_before' | 'ordering'
>

interface UseOutsideMagTableQueryOptions {
  enabled?: boolean
}

export function useOutsideMagTableQuery(
  listParams: OutsideMagTableListParams,
  { enabled = true }: UseOutsideMagTableQueryOptions = {},
) {
  const query = useInfiniteQuery({
    queryKey: [
      'outside-mag-table',
      {
        stage: 'out_of_mag_scope' as const,
        ordering: PROJECTS_LIST_DEFAULT_ORDERING,
        ...listParams,
      },
    ] as const,
    initialPageParam: 0,
    enabled,
    queryFn: ({ pageParam, signal }) =>
      projectsList(
        {
          ...listParams,
          stage: 'out_of_mag_scope',
          ordering: PROJECTS_LIST_DEFAULT_ORDERING,
          limit: PAGE_SIZE,
          offset: pageParam,
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
