import { useMemo } from 'react'

import { mapBackendOutOfMagProjects } from '@/entities/project'
import { useProjectsOutOfMagList } from '@/shared/api/generated/hooks/projectsController/useProjectsOutOfMagList'
import type { ProjectsOutOfMagListQueryParams } from '@/shared/api/generated/types/projectsController/ProjectsOutOfMagList'
import { PROJECTS_LIST_DEFAULT_ORDERING } from '@/shared/constants/projects-list-ordering'

export type OutsideMagTableListParams = Pick<
  ProjectsOutOfMagListQueryParams,
  'event_date_after' | 'event_date_before' | 'ordering'
>

interface UseOutsideMagTableQueryOptions {
  enabled?: boolean
}

export function useOutsideMagTableQuery(
  listParams: OutsideMagTableListParams,
  { enabled = true }: UseOutsideMagTableQueryOptions = {},
) {
  const params = useMemo(
    (): ProjectsOutOfMagListQueryParams => ({
      ...listParams,
      ordering: listParams.ordering ?? PROJECTS_LIST_DEFAULT_ORDERING,
    }),
    [listParams],
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
