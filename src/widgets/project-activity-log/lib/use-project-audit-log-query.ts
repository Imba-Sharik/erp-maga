import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'

import { useManagersDirectory } from '@/entities/manager'
import {
  mapAuditLogEntries,
  type AuditLogFormatContext,
  type ProjectActivityEvent,
} from '@/entities/project-activity'
import { projectsAuditLogList } from '@/shared/api/generated/clients/projectsController/projectsAuditLogList'
import { projectsAuditLogListQueryKey } from '@/shared/api/generated/hooks/projectsController/useProjectsAuditLogList'

const PAGE_SIZE = 50

export interface UseProjectAuditLogQueryResult {
  events: ProjectActivityEvent[]
  isLoading: boolean
  isError: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
}

function buildAuditLogFormatContext(
  managers: ReadonlyArray<{ id: string; fullName: string }>,
): AuditLogFormatContext {
  return {
    managerNameById: new Map(
      managers.map((manager) => [Number(manager.id), manager.fullName] as const),
    ),
  }
}

export function useProjectAuditLogQuery({
  projectId,
  enabled = true,
}: {
  projectId: number
  enabled?: boolean
}): UseProjectAuditLogQueryResult {
  const { managers } = useManagersDirectory()

  const formatContext = useMemo(() => buildAuditLogFormatContext(managers), [managers])

  const query = useInfiniteQuery({
    queryKey: projectsAuditLogListQueryKey(projectId, { limit: PAGE_SIZE }),
    enabled: enabled && projectId > 0,
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      projectsAuditLogList(projectId, { limit: PAGE_SIZE, offset: pageParam }, { signal }),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.next ? allPages.length * PAGE_SIZE : undefined,
  })

  const events = useMemo(
    () =>
      mapAuditLogEntries(query.data?.pages.flatMap((page) => page.results) ?? [], formatContext),
    [formatContext, query.data],
  )

  return {
    events,
    isLoading: query.isLoading,
    isError: query.isError,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: () => query.fetchNextPage(),
  }
}
