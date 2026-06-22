import type { QueryClient } from '@tanstack/react-query'

import type { Project as ApiProject } from '@/shared/api/generated/types/Project'
import { prependProjectToMatchingCaches, removeProjectFromMatchingCaches } from '@/shared/api'

function cacheOptionsForProject(project: ApiProject) {
  return {
    boardApiStage: project.stage,
    includeNonBoard: true as const,
  }
}

/** Добавить проект в кэши списков `/api/v1/projects/` (канбан и календарь). */
export function prependCreatedProjectToQueries(
  queryClient: QueryClient,
  project: ApiProject,
): void {
  prependProjectToMatchingCaches(queryClient, project, cacheOptionsForProject(project))
}

/** Убрать проект из тех же кэшей (откат optimistic или замена на ответ API). */
export function removeCreatedProjectFromQueries(
  queryClient: QueryClient,
  project: ApiProject,
): void {
  removeProjectFromMatchingCaches(queryClient, project, cacheOptionsForProject(project))
}
