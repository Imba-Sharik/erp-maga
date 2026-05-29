import type { QueryClient } from '@tanstack/react-query'

import { projectsAuditLogListQueryKey } from '@/shared/api/generated/hooks/projectsController/useProjectsAuditLogList'
import { projectsListQueryKey } from '@/shared/api/generated/hooks/projectsController/useProjectsList'
import { projectsOutOfMagListQueryKey } from '@/shared/api/generated/hooks/projectsController/useProjectsOutOfMagList'
import { projectsRetrieveQueryKey } from '@/shared/api/generated/hooks/projectsController/useProjectsRetrieve'
import type { OutOfMagProject } from '@/shared/api/generated/types/OutOfMagProject'
import { invalidateKanbanBoardQueries } from '@/shared/api/projects-kanban'

export function invalidateProjectsListQueries(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: projectsListQueryKey() })
}

export function invalidateOutsideMagQueries(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: projectsOutOfMagListQueryKey() })
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

export function removeProjectFromOutsideMagCaches(
  queryClient: QueryClient,
  projectId: number,
): void {
  queryClient.setQueriesData<OutOfMagProject[]>(
    { queryKey: projectsOutOfMagListQueryKey() },
    (prev) => (prev ? prev.filter((row) => row.id !== projectId) : prev),
  )
}
