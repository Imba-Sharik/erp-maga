import type { InfiniteData, QueryClient } from '@tanstack/react-query'

import { projectsAuditLogListQueryKey } from '@/shared/api/generated/hooks/projectsController/useProjectsAuditLogList'
import { projectsListQueryKey } from '@/shared/api/generated/hooks/projectsController/useProjectsList'
import { projectsOutOfMagListQueryKey } from '@/shared/api/generated/hooks/projectsController/useProjectsOutOfMagList'
import { projectsRetrieveQueryKey } from '@/shared/api/generated/hooks/projectsController/useProjectsRetrieve'
import type { PaginatedOutOfMagProjectList } from '@/shared/api/generated/types/PaginatedOutOfMagProjectList'
import { invalidateKanbanBoardQueries } from '@/shared/api/projects-kanban'

const OUTSIDE_MAG_TABLE_QUERY_KEY = ['projects-out-of-mag-table'] as const

export function invalidateProjectsListQueries(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: projectsListQueryKey() })
}

export function invalidateOutsideMagQueries(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: projectsOutOfMagListQueryKey() })
  queryClient.invalidateQueries({ queryKey: OUTSIDE_MAG_TABLE_QUERY_KEY })
}

export function invalidateProjectAfterTransition(
  queryClient: QueryClient,
  projectId: number,
): void {
  queryClient.invalidateQueries({ queryKey: projectsRetrieveQueryKey(projectId) })
  queryClient.invalidateQueries({ queryKey: projectsAuditLogListQueryKey(projectId) })
  invalidateProjectsListQueries(queryClient)
  invalidateOutsideMagQueries(queryClient)
  invalidateKanbanBoardQueries(queryClient)
}

function stripProjectFromOutOfMagPages(
  data: InfiniteData<PaginatedOutOfMagProjectList>,
  projectId: number,
): InfiniteData<PaginatedOutOfMagProjectList> {
  return {
    ...data,
    pages: data.pages.map((page) => {
      const results = page.results.filter((row) => row.id !== projectId)
      if (results.length === page.results.length) return page
      return { ...page, results, count: Math.max(0, page.count - 1) }
    }),
  }
}

export function removeProjectFromOutsideMagCaches(
  queryClient: QueryClient,
  projectId: number,
): void {
  const updateInfinite = (prev: InfiniteData<PaginatedOutOfMagProjectList> | undefined) =>
    prev ? stripProjectFromOutOfMagPages(prev, projectId) : prev

  queryClient.setQueriesData<InfiniteData<PaginatedOutOfMagProjectList>>(
    { queryKey: [{ url: '/api/v1/projects/out-of-mag/' }] },
    updateInfinite,
  )
  queryClient.setQueriesData<InfiniteData<PaginatedOutOfMagProjectList>>(
    { queryKey: OUTSIDE_MAG_TABLE_QUERY_KEY },
    updateInfinite,
  )
}
