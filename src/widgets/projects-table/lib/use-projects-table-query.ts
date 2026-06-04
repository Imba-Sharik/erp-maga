import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'

import {
  mapBackendProjects,
  plumEventStatusFilterParam,
  PROJECTS_TABLE_DEFAULT_STAGE_IN,
  PROJECTS_TABLE_PENDING_STAGE_IN_PARAM,
} from '@/entities/project'
import { projectsList } from '@/shared/api/generated/clients/projectsController/projectsList'
import type { ProjectsListQueryParamsStageEnumKey } from '@/shared/api/generated/types/projectsController/ProjectsList'
import { PROJECTS_LIST_DEFAULT_ORDERING } from '@/shared/constants/projects-list-ordering'

const PAGE_SIZE = 50

type StageParams = { stage: ProjectsListQueryParamsStageEnumKey } | { stage__in: string }

interface UseProjectsTableQueryParams {
  /** Тумблер «Ожидают обработки». */
  pendingOnly: boolean
  /** Выбранный этап в шапке-фильтре «Этап проекта» (или `null`). */
  stage: string | null
  /** ID менеджера MAG для `mag_manager` (или `null`). */
  magManagerId: string | null
  /** Код статуса Plum в шапке таблицы (`plum_event_status`). */
  plumEventStatus: string | null
  /** Серверный поиск по названию проекта (`event_name`). */
  search?: string
}

/**
 * Этап — всегда параметр запроса, не клиентский фильтр:
 * - выбран этап в шапке → `stage=<этап>`;
 * - иначе `stage__in`: все активные воронки (без вне контура и архива) или
 *   подмножество при тумблере «Ожидают обработки».
 */
function parseMagManagerId(magManagerId: string | null): number | undefined {
  if (!magManagerId) return undefined
  const id = Number(magManagerId)
  return Number.isFinite(id) ? id : undefined
}

export function useProjectsTableQuery({
  pendingOnly,
  stage,
  magManagerId,
  plumEventStatus,
  search,
}: UseProjectsTableQueryParams) {
  const stageParams: StageParams = stage
    ? { stage: stage as ProjectsListQueryParamsStageEnumKey }
    : {
        stage__in: pendingOnly
          ? PROJECTS_TABLE_PENDING_STAGE_IN_PARAM
          : PROJECTS_TABLE_DEFAULT_STAGE_IN,
      }

  const mag_manager = parseMagManagerId(magManagerId)
  const plum_event_status = plumEventStatusFilterParam(plumEventStatus)
  const trimmedSearch = search?.trim() || undefined

  const query = useInfiniteQuery({
    queryKey: [
      'projects-table',
      {
        ...stageParams,
        ordering: PROJECTS_LIST_DEFAULT_ORDERING,
        mag_manager,
        plum_event_status,
        search: trimmedSearch,
      },
    ] as const,
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      projectsList(
        {
          ...stageParams,
          ordering: PROJECTS_LIST_DEFAULT_ORDERING,
          limit: PAGE_SIZE,
          offset: pageParam,
          ...(mag_manager !== undefined ? { mag_manager } : {}),
          ...(plum_event_status !== undefined ? { plum_event_status } : {}),
          ...(trimmedSearch ? { search: trimmedSearch } : {}),
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
