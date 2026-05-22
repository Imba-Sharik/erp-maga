import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'

import { mapBackendProjects } from '@/entities/project'
import { projectsList } from '@/shared/api/generated/clients/projectsController/projectsList'
import type { ProjectsListQueryParamsStageEnumKey } from '@/shared/api/generated/types/projectsController/ProjectsList'
import { PROJECTS_LIST_DEFAULT_ORDERING } from '@/shared/constants/projects-list-ordering'

const PAGE_SIZE = 50

export type RequestsTableVariant = 'open' | 'closed'

/** Открытые запросы — проект на этапе подтверждения документов, ждёт бухгалтера. */
const OPEN_STAGE: ProjectsListQueryParamsStageEnumKey = 'documents_confirmed'

/** Закрытые запросы — этапы после подтверждения документов (бухгалтер уже отработал). */
const CLOSED_STAGE_IN = [
  'feedback_received',
  'data_confirmed',
  'bonus_calculated',
  'bonus_approved',
  'closed',
  'archived',
].join(',')

type StageParams = { stage: ProjectsListQueryParamsStageEnumKey } | { stage__in: string }

/**
 * Запросы бухгалтера. Этап — всегда параметр запроса:
 * - `open` → `stage=documents_confirmed` (ждут подтверждения);
 * - `closed` → `stage__in=<этапы после подтверждения>`.
 */
export function useRequestsTableQuery(variant: RequestsTableVariant) {
  const stageParams: StageParams =
    variant === 'open' ? { stage: OPEN_STAGE } : { stage__in: CLOSED_STAGE_IN }

  const query = useInfiniteQuery({
    queryKey: ['requests-table', { variant, ...stageParams }] as const,
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      projectsList(
        {
          ...stageParams,
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
