import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'

import type { Project } from '@/entities/project'
import { mapBackendProjects } from '@/entities/project'
import { projectsList } from '@/shared/api/generated/clients/projectsController/projectsList'
import { PROJECTS_LIST_DEFAULT_ORDERING } from '@/shared/constants/projects-list-ordering'

const PAGE_SIZE = 50

export interface UseClosingArchiveQueryResult {
  projects: Project[]
  isLoading: boolean
  isError: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
}

/**
 * Архив завершённых проектов — `stage=archived`. Ключ начинается с
 * `['projects-table', …]` (как admin-таблица), поэтому оптимистичное удаление
 * из `useDeleteProject` (setQueriesData по префиксу `['projects-table']`)
 * автоматически убирает строку и отсюда.
 */
export function useClosingArchiveQuery({
  enabled = true,
}: { enabled?: boolean } = {}): UseClosingArchiveQueryResult {
  const query = useInfiniteQuery({
    queryKey: [
      'projects-table',
      { stage: 'archived', ordering: PROJECTS_LIST_DEFAULT_ORDERING },
    ] as const,
    enabled,
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      projectsList(
        {
          stage: 'archived',
          ordering: PROJECTS_LIST_DEFAULT_ORDERING,
          limit: PAGE_SIZE,
          offset: pageParam,
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
