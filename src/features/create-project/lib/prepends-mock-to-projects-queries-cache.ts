import type { QueryClient } from '@tanstack/react-query'

import type { Project as ApiProject } from '@/shared/api/generated/types/Project'
import { prependProjectToMatchingCaches } from '@/widgets/projects-board/lib/kanban-projects-cache'

/** Вклинить мок-проект в кэши списков `/api/v1/projects/` (календарь и доска). */
export function prependMockProjectToProjectsQueries(
  queryClient: QueryClient,
  project: ApiProject,
): void {
  prependProjectToMatchingCaches(queryClient, project, {
    boardApiStage: project.stage,
    includeNonBoard: true,
  })
}
