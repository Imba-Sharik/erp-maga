import { useInfiniteQuery } from '@tanstack/react-query'

import { projectsList } from '@/shared/api/generated/clients/projectsController/projectsList'
import type { ProjectsListQueryParams } from '@/shared/api/generated/types/projectsController/ProjectsList'

const PAGE_SIZE = 50

type UseProjectsBoardQueryParams = Pick<ProjectsListQueryParams, 'event_date_after' | 'event_date_before'>

export function useProjectsBoardQuery(params: UseProjectsBoardQueryParams) {
  return useInfiniteQuery({
    queryKey: [{ url: '/api/v1/projects/', scope: 'board' }, params] as const,
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      projectsList({ ...params, limit: PAGE_SIZE, offset: pageParam }, { signal }),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.next) return undefined
      return allPages.length * PAGE_SIZE
    },
  })
}
