import type { ProjectsListQueryParamsStageEnumKey } from '@/shared/api/generated/types/projectsController/ProjectsList'

export type AccountantRequestsStageParams =
  | { stage: ProjectsListQueryParamsStageEnumKey }
  | { stage__in: string }

/**
 * Параметры списка открытых запросов бухгалтера.
 * TODO: при skip этапа директором — возможно `documents_pending` или расширенный фильтр с бэка.
 */
export function buildOpenRequestsQueryParams(): AccountantRequestsStageParams {
  return { stage: 'documents_confirmed' }
}
