import { useMemo } from 'react'

import { mapBackendOutOfMagProjects } from '@/entities/project'
import { useProjectsOutOfMagList } from '@/shared/api/generated/hooks/projectsController/useProjectsOutOfMagList'
import type { ProjectsOutOfMagListQueryParams } from '@/shared/api/generated/types/projectsController/ProjectsOutOfMagList'
import { PROJECTS_LIST_DEFAULT_ORDERING } from '@/shared/constants/projects-list-ordering'

export type OutsideMagTableListParams = Pick<
  ProjectsOutOfMagListQueryParams,
  'event_date_after' | 'event_date_before' | 'ordering' | 'search'
>

interface UseOutsideMagTableQueryOptions {
  enabled?: boolean
}

function parseMagManagerId(magManagerId: string | null): number | undefined {
  if (!magManagerId) return undefined
  const id = Number(magManagerId)
  return Number.isFinite(id) ? id : undefined
}

export function useOutsideMagTableQuery(
  listParams: OutsideMagTableListParams,
  magManagerId: string | null,
  { enabled = true }: UseOutsideMagTableQueryOptions = {},
) {
  const mag_manager = parseMagManagerId(magManagerId)

  const params = useMemo(
    (): ProjectsOutOfMagListQueryParams => ({
      ...listParams,
      ordering: listParams.ordering ?? PROJECTS_LIST_DEFAULT_ORDERING,
      ...(mag_manager !== undefined ? { mag_manager } : {}),
    }),
    [listParams, mag_manager],
  )

  const query = useProjectsOutOfMagList(params, {
    query: { enabled },
  })

  const projects = useMemo(
    () => (query.data ? mapBackendOutOfMagProjects(query.data) : []),
    [query.data],
  )

  return {
    projects,
    totalCount: projects.length,
    fetchNextPage: () => {},
    hasNextPage: false,
    isLoading: query.isLoading,
    isError: query.isError,
    isFetchingNextPage: false,
  }
}
