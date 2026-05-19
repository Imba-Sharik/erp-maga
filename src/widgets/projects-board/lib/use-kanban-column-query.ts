import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'

import { mapBackendProjects } from '@/entities/project'
import { projectsList } from '@/shared/api/generated/clients/projectsController/projectsList'
import type { StageEnum } from '@/shared/api/generated/types/StageEnum'

import {
  kanbanColumnQueryKey,
  type BoardListParams,
  type KanbanBoardScope,
} from './kanban-board-query'

const PAGE_SIZE = 50

export interface UseKanbanColumnQueryParams {
  scope: KanbanBoardScope
  apiStage: StageEnum
  listParams: BoardListParams
  enabled?: boolean
}

export function useKanbanColumnQuery({
  scope,
  apiStage,
  listParams,
  enabled = true,
}: UseKanbanColumnQueryParams) {
  const query = useInfiniteQuery({
    queryKey: kanbanColumnQueryKey(scope, apiStage, listParams),
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      projectsList(
        {
          ...listParams,
          stage: apiStage,
          limit: PAGE_SIZE,
          offset: pageParam,
        },
        { signal },
      ),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.next) return undefined
      return allPages.length * PAGE_SIZE
    },
    enabled,
  })

  const projects = useMemo(() => {
    const raw = query.data?.pages.flatMap((p) => p.results) ?? []
    const mapped = mapBackendProjects(raw)
    return mapped.sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
  }, [query.data])

  const totalCount = query.data?.pages[0]?.count

  return {
    projects,
    totalCount,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    isError: query.isError,
  }
}
