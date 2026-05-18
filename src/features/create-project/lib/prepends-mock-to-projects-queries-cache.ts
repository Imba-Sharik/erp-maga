import type {
  InfiniteData,
  QueryClient,
} from '@tanstack/react-query'

import type { Project as ApiProject } from '@/shared/api/generated/types/Project'
import type { PaginatedProjectList } from '@/shared/api/generated/types/PaginatedProjectList'
import type { ProjectsListQueryParams } from '@/shared/api/generated/types/projectsController/ProjectsList'

function isProjectsListRootKey(first: unknown): boolean {
  return (
    typeof first === 'object' &&
    first !== null &&
    'url' in first &&
    (first as { url: string }).url === '/api/v1/projects/'
  )
}

function listParams(queryKey: readonly unknown[]): ProjectsListQueryParams | undefined {
  const p = queryKey[1]
  if (typeof p !== 'object' || p === null) return undefined
  return p as ProjectsListQueryParams
}

function eventDateMatchesParams(
  eventDate: string,
  params: ProjectsListQueryParams | undefined,
): boolean {
  if (!params) return true
  const { event_date_after, event_date_before } = params
  if (event_date_after && eventDate < event_date_after) return false
  if (event_date_before && eventDate > event_date_before) return false
  return true
}

function patchPaginated(prev: PaginatedProjectList, project: ApiProject): PaginatedProjectList {
  const already =
    prev.results.some((row) => row.id === project.id) ||
    prev.results.some((row) => row.plum_event_id === project.plum_event_id)

  return {
    ...prev,
    count: already ? prev.count : prev.count + 1,
    results: already ? prev.results : [project, ...prev.results],
  }
}

function patchInfinite(prev: InfiniteData<PaginatedProjectList>, project: ApiProject) {
  if (!prev.pages.length) return prev
  const already = prev.pages.some((page) =>
    page.results.some(
      (row) => row.id === project.id || row.plum_event_id === project.plum_event_id,
    ),
  )
  if (already) return prev

  const [first, ...rest] = prev.pages
  const nextFirst = {
    ...first,
    count: first.count + 1,
    results: [project, ...first.results],
  }
  return { ...prev, pages: [nextFirst, ...rest] }
}

/** Вклинить мок-проект в кэши списков `/api/v1/projects/` (календарь и доска). */
export function prependMockProjectToProjectsQueries(
  queryClient: QueryClient,
  project: ApiProject,
): void {
  const eventDate = project.event_date
  const cache = queryClient.getQueryCache()
  const entries = cache.findAll()

  for (const query of entries) {
    const [first] = query.queryKey as readonly unknown[]
    if (!isProjectsListRootKey(first)) continue

    const params = listParams(query.queryKey as readonly unknown[])
    if (!eventDateMatchesParams(eventDate, params)) continue

    queryClient.setQueryData(query.queryKey, (raw) => {
      if (!raw || typeof raw !== 'object') return raw

      if ('pages' in raw && Array.isArray((raw as InfiniteData<PaginatedProjectList>).pages)) {
        return patchInfinite(raw as InfiniteData<PaginatedProjectList>, project)
      }

      if ('results' in raw && Array.isArray((raw as PaginatedProjectList).results)) {
        return patchPaginated(raw as PaginatedProjectList, project)
      }

      return raw
    })
  }
}
