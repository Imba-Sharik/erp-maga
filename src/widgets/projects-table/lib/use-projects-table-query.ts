import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'

import { mapBackendProjects } from '@/entities/project'
import { projectsList } from '@/shared/api/generated/clients/projectsController/projectsList'
import type { ProjectsListQueryParamsStageEnumKey } from '@/shared/api/generated/types/projectsController/ProjectsList'
import { PROJECTS_LIST_DEFAULT_ORDERING } from '@/shared/constants/projects-list-ordering'

const PAGE_SIZE = 50

/**
 * Обычный режим — вся предпроектная воронка, одним запросом через `stage__in`.
 * (В отличие от канбана: там 5 запросов по одному `stage` на колонку.)
 */
const PREPROJECT_STAGE_IN = [
  'plum_request',
  'primary_contact_done',
  'calculation_prepared',
  'contract_signed',
  'ready_to_event',
].join(',')

/** «Ожидают обработки» — поздние этапы закрытия, ждущие финальной обработки. */
const PENDING_STAGE_IN = ['data_confirmed', 'bonus_approved'].join(',')

type StageParams = { stage: ProjectsListQueryParamsStageEnumKey } | { stage__in: string }

interface UseProjectsTableQueryParams {
  /** Тумблер «Ожидают обработки». */
  pendingOnly: boolean
  /** Выбранный этап в шапке-фильтре «Этап проекта» (или `null`). */
  stage: string | null
}

/**
 * Этап — это всегда параметр запроса, не клиентский фильтр:
 * - выбран конкретный этап в фильтре → точный `stage=<этап>` (новый запрос);
 * - иначе → группа этапов через `stage__in` (зависит от тумблера).
 */
export function useProjectsTableQuery({ pendingOnly, stage }: UseProjectsTableQueryParams) {
  const stageParams: StageParams = stage
    ? { stage: stage as ProjectsListQueryParamsStageEnumKey }
    : { stage__in: pendingOnly ? PENDING_STAGE_IN : PREPROJECT_STAGE_IN }

  const query = useInfiniteQuery({
    queryKey: [
      'projects-table',
      { ...stageParams, ordering: PROJECTS_LIST_DEFAULT_ORDERING },
    ] as const,
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
