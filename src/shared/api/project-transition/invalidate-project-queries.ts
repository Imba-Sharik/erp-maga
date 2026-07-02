import type { InfiniteData, QueryClient } from '@tanstack/react-query'

import { projectsAuditLogListQueryKey } from '@/shared/api/generated/hooks/projectsController/useProjectsAuditLogList'
import { projectsListQueryKey } from '@/shared/api/generated/hooks/projectsController/useProjectsList'
import { projectsOutOfMagListQueryKey } from '@/shared/api/generated/hooks/projectsController/useProjectsOutOfMagList'
import { projectsPipelineRetrieveQueryKey } from '@/shared/api/generated/hooks/projectsController/useProjectsPipelineRetrieve'
import { projectsRetrieveQueryKey } from '@/shared/api/generated/hooks/projectsController/useProjectsRetrieve'
import type { PaginatedOutOfMagProjectList } from '@/shared/api/generated/types/PaginatedOutOfMagProjectList'
import { invalidateKanbanBoardQueries } from '../projects-kanban'

const OUTSIDE_MAG_TABLE_QUERY_KEY = ['projects-out-of-mag-table'] as const

// Таблицы проектов используют собственные корневые ключи (не сгенерированный
// `[{ url: '/api/v1/projects/' }]`), поэтому их нужно инвалидировать явно — иначе после
// мутации (смена менеджера, переход этапа) строки не обновятся до перезагрузки. Корни:
// `['projects-table', …]` — «Все проекты» + архив закрытия (use-projects-table-query,
// use-closing-archive-query); `['projects-closing-active-table', …]` — активное закрытие;
// `['requests-table', …]` — запросы бухгалтера.
const PROJECTS_TABLE_QUERY_KEY = ['projects-table'] as const
const CLOSING_ACTIVE_TABLE_QUERY_KEY = ['projects-closing-active-table'] as const
const REQUESTS_TABLE_QUERY_KEY = ['requests-table'] as const

export function invalidateProjectsListQueries(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: projectsListQueryKey() })
  queryClient.invalidateQueries({ queryKey: PROJECTS_TABLE_QUERY_KEY })
  queryClient.invalidateQueries({ queryKey: CLOSING_ACTIVE_TABLE_QUERY_KEY })
  queryClient.invalidateQueries({ queryKey: REQUESTS_TABLE_QUERY_KEY })
}

export function invalidateOutsideMagQueries(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: projectsOutOfMagListQueryKey() })
  queryClient.invalidateQueries({ queryKey: OUTSIDE_MAG_TABLE_QUERY_KEY })
}

export function invalidateProjectAfterTransition(
  queryClient: QueryClient,
  projectId: number,
): void {
  queryClient.invalidateQueries({ queryKey: projectsRetrieveQueryKey(projectId) })
  // Pipeline-state — источник per-block флагов can_edit_*: без инвалидации после
  // перехода/отката видимость кнопок «Редактировать» протухает до ремаунта.
  queryClient.invalidateQueries({ queryKey: projectsPipelineRetrieveQueryKey(projectId) })
  queryClient.invalidateQueries({ queryKey: projectsAuditLogListQueryKey(projectId) })
  invalidateProjectsListQueries(queryClient)
  invalidateOutsideMagQueries(queryClient)
  invalidateKanbanBoardQueries(queryClient)
}

function stripProjectFromOutOfMagPages(
  data: InfiniteData<PaginatedOutOfMagProjectList>,
  projectId: number,
): InfiniteData<PaginatedOutOfMagProjectList> {
  return {
    ...data,
    pages: data.pages.map((page) => {
      const results = page.results.filter((row) => row.id !== projectId)
      if (results.length === page.results.length) return page
      return { ...page, results, count: Math.max(0, page.count - 1) }
    }),
  }
}

export function removeProjectFromOutsideMagCaches(
  queryClient: QueryClient,
  projectId: number,
): void {
  const updateInfinite = (prev: InfiniteData<PaginatedOutOfMagProjectList> | undefined) =>
    prev ? stripProjectFromOutOfMagPages(prev, projectId) : prev

  queryClient.setQueriesData<InfiniteData<PaginatedOutOfMagProjectList>>(
    { queryKey: [{ url: '/api/v1/projects/out-of-mag/' }] },
    updateInfinite,
  )
  queryClient.setQueriesData<InfiniteData<PaginatedOutOfMagProjectList>>(
    { queryKey: OUTSIDE_MAG_TABLE_QUERY_KEY },
    updateInfinite,
  )
}
