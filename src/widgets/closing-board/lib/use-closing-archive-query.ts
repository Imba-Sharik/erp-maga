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
 * Архив завершённых проектов — `archived_only=true` (по умолчанию archived
 * скрыты в `/projects/`). Ключ начинается с `['projects-table', …]` (как
 * admin-таблица), поэтому оптимистичное удаление из `useDeleteProject`
 * (setQueriesData по префиксу `['projects-table']`) автоматически убирает строку.
 */
export function useClosingArchiveQuery({
  enabled = true,
  search,
  hall_id,
  loft_id,
}: {
  enabled?: boolean
  search?: string
  hall_id?: number
  loft_id?: number
} = {}): UseClosingArchiveQueryResult {
  const trimmedSearch = search?.trim() || undefined

  const query = useInfiniteQuery({
    queryKey: [
      'projects-table',
      {
        archived_only: true,
        ordering: PROJECTS_LIST_DEFAULT_ORDERING,
        search: trimmedSearch,
        hall_id,
        loft_id,
      },
    ] as const,
    enabled,
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      projectsList(
        {
          archived_only: true,
          ordering: PROJECTS_LIST_DEFAULT_ORDERING,
          limit: PAGE_SIZE,
          offset: pageParam,
          ...(trimmedSearch ? { search: trimmedSearch } : {}),
          ...(hall_id !== undefined ? { hall_id } : {}),
          ...(loft_id !== undefined ? { loft_id } : {}),
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
