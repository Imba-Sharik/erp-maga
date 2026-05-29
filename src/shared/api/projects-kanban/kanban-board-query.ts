import type { QueryClient } from '@tanstack/react-query'

import type { ProjectStageEnumKey } from '@/shared/api/generated/types/Project'
import type { ProjectsListQueryParams } from '@/shared/api/generated/types/projectsController/ProjectsList'

export type KanbanBoardScope = 'board-preproject' | 'board-closing' | 'board-outside-mag'

export type BoardListParams = Pick<
  ProjectsListQueryParams,
  'event_date_after' | 'event_date_before' | 'ordering' | 'search'
>

export function kanbanColumnQueryKey(
  scope: KanbanBoardScope,
  apiStage: ProjectStageEnumKey,
  listParams: BoardListParams,
) {
  return [{ url: '/api/v1/projects/' as const, scope, apiStage }, listParams] as const
}

export function isKanbanBoardQueryKey(first: unknown): first is {
  url: string
  scope: KanbanBoardScope
  apiStage: ProjectStageEnumKey
} {
  return (
    typeof first === 'object' &&
    first !== null &&
    'url' in first &&
    (first as { url: string }).url === '/api/v1/projects/' &&
    'scope' in first &&
    ((first as { scope: string }).scope === 'board-preproject' ||
      (first as { scope: string }).scope === 'board-closing' ||
      (first as { scope: string }).scope === 'board-outside-mag') &&
    'apiStage' in first
  )
}

export function invalidateKanbanBoardQueries(queryClient: QueryClient): void {
  queryClient.invalidateQueries({
    predicate: (query) => isKanbanBoardQueryKey(query.queryKey[0]),
  })
}

export function kanbanColumnMatchesProjectStage(
  queryKey: readonly unknown[],
  projectStage: ProjectStageEnumKey | undefined,
): boolean {
  if (!projectStage) return false
  const first = queryKey[0]
  if (!isKanbanBoardQueryKey(first)) return true
  return first.apiStage === projectStage
}
