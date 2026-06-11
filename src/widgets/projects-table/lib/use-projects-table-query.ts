import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'

import {
  mapBackendProjects,
  plumEventStatusFilterQueryParams,
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
  /** Коды статуса Plum в шапке таблицы (`plum_event_status` / `plum_event_status__in`). */
  plumEventStatus: string[]
  /** Серверный поиск по названию проекта (`event_name`). */
  search?: string
  /** Фильтр по лофту (`loft_id`). */
  loft_id?: number
  /** Фильтр по залу (`hall_id`). */
  hall_id?: number
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
  loft_id,
  hall_id,
}: UseProjectsTableQueryParams) {
  const stageParams: StageParams = stage
    ? { stage: stage as ProjectsListQueryParamsStageEnumKey }
    : {
        stage__in: pendingOnly
          ? PROJECTS_TABLE_PENDING_STAGE_IN_PARAM
          : PROJECTS_TABLE_DEFAULT_STAGE_IN,
      }

  const mag_manager = parseMagManagerId(magManagerId)
  const plumStatusParams = plumEventStatusFilterQueryParams(plumEventStatus)
  const trimmedSearch = search?.trim() || undefined

  const query = useInfiniteQuery({
    queryKey: [
      'projects-table',
      {
        ...stageParams,
        ordering: PROJECTS_LIST_DEFAULT_ORDERING,
        mag_manager,
        ...plumStatusParams,
        search: trimmedSearch,
        loft_id,
        hall_id,
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
          ...plumStatusParams,
          ...(trimmedSearch ? { search: trimmedSearch } : {}),
          ...(loft_id !== undefined ? { loft_id } : {}),
          ...(hall_id !== undefined ? { hall_id } : {}),
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
