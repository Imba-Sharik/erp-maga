import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'

import { PRE_PROJECT_STAGES, preprojectStageToApi, type PreprojectStage } from '@/entities/project'
import { projectsList } from '@/shared/api/generated/clients/projectsController/projectsList'
import type { ProjectsListQueryParams } from '@/shared/api/generated/types/projectsController/ProjectsList'

const COUNT_PAGE = 1

type BoardDateParams = Pick<ProjectsListQueryParams, 'event_date_after' | 'event_date_before'>

export function useProjectsBoardStageCounts(params: BoardDateParams & { enabled?: boolean }) {
  const { enabled = true, ...listParams } = params

  const queries = useQueries({
    queries: PRE_PROJECT_STAGES.map((stage) => ({
      queryKey: [{ url: '/api/v1/projects/', scope: 'board-stage-count' }, listParams, stage] as const,
      queryFn: ({ signal }) =>
        projectsList(
          {
            ...listParams,
            stage: preprojectStageToApi(stage),
            limit: COUNT_PAGE,
            offset: 0,
          },
          { signal },
        ),
      enabled,
      staleTime: 30_000,
    })),
  })

  const totalsByStage = useMemo(() => {
    const acc: Partial<Record<PreprojectStage, number>> = {}
    PRE_PROJECT_STAGES.forEach((stage, i) => {
      const n = queries[i]?.data?.count
      if (typeof n === 'number') acc[stage] = n
    })
    return acc
  }, [queries])

  const isLoading = enabled && queries.some((q) => q.isPending)

  return { totalsByStage, isLoading }
}
