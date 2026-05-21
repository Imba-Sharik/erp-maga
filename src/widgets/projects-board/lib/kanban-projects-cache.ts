import type { InfiniteData, QueryClient } from '@tanstack/react-query'

import type { Project as ApiProject } from '@/shared/api/generated/types/Project'
import type { PaginatedProjectList } from '@/shared/api/generated/types/PaginatedProjectList'
import type { ProjectsListQueryParams } from '@/shared/api/generated/types/projectsController/ProjectsList'
import type { ProjectStageEnumKey } from '@/shared/api/generated/types/Project'

import { isKanbanBoardQueryKey } from './kanban-board-query'

export type KanbanCacheSnapshot = ReadonlyArray<
  readonly [queryKey: readonly unknown[], data: unknown]
>

function isProjectsListRootKey(first: unknown): boolean {
  return (
    typeof first === 'object' &&
    first !== null &&
    'url' in first &&
    (first as { url: string }).url === '/api/v1/projects/'
  )
}

function listParamsFromQueryKey(queryKey: readonly unknown[]): ProjectsListQueryParams | undefined {
  const p = queryKey[1]
  if (typeof p !== 'object' || p === null) return undefined
  return p as ProjectsListQueryParams
}

export function eventDateMatchesListParams(
  eventDate: string,
  params: ProjectsListQueryParams | undefined,
): boolean {
  if (!params) return true
  const { event_date_after, event_date_before } = params
  if (event_date_after && eventDate < event_date_after) return false
  if (event_date_before && eventDate > event_date_before) return false
  return true
}

function projectMatchesRow(project: ApiProject, row: ApiProject): boolean {
  return row.id === project.id || row.plum_event_id === project.plum_event_id
}

export function matchesBoardColumn(
  queryKey: readonly unknown[],
  apiStage: ProjectStageEnumKey,
): boolean {
  const first = queryKey[0]
  if (!isKanbanBoardQueryKey(first)) return false
  return first.apiStage === apiStage
}

type ProjectsListQueryPredicate = (queryKey: readonly unknown[]) => boolean

export function forEachMatchingProjectsListQuery(
  queryClient: QueryClient,
  predicate: ProjectsListQueryPredicate,
  patch: (queryKey: readonly unknown[], raw: unknown) => unknown,
): void {
  for (const query of queryClient.getQueryCache().findAll()) {
    const queryKey = query.queryKey as readonly unknown[]
    const [first] = queryKey
    if (!isProjectsListRootKey(first)) continue
    if (!predicate(queryKey)) continue

    queryClient.setQueryData(query.queryKey, (raw) => {
      if (!raw || typeof raw !== 'object') return raw
      return patch(queryKey, raw)
    })
  }
}

export function removeProjectFromPaginatedCache(
  prev: PaginatedProjectList,
  project: ApiProject,
): PaginatedProjectList {
  const nextResults = prev.results.filter((row) => !projectMatchesRow(project, row))
  if (nextResults.length === prev.results.length) return prev
  return {
    ...prev,
    count: Math.max(0, prev.count - 1),
    results: nextResults,
  }
}

export function prependProjectToPaginatedCache(
  prev: PaginatedProjectList,
  project: ApiProject,
): PaginatedProjectList {
  if (prev.results.some((row) => projectMatchesRow(project, row))) return prev
  return {
    ...prev,
    count: prev.count + 1,
    results: [project, ...prev.results],
  }
}

export function removeProjectFromInfiniteCache(
  prev: InfiniteData<PaginatedProjectList>,
  project: ApiProject,
): InfiniteData<PaginatedProjectList> {
  let removed = false
  const nextPages = prev.pages.map((page) => {
    const nextResults = page.results.filter((row) => !projectMatchesRow(project, row))
    if (nextResults.length !== page.results.length) removed = true
    return { ...page, results: nextResults }
  })
  if (!removed) return prev
  nextPages[0] = {
    ...nextPages[0],
    count: Math.max(0, nextPages[0].count - 1),
  }
  return { ...prev, pages: nextPages }
}

export function prependProjectToInfiniteCache(
  prev: InfiniteData<PaginatedProjectList>,
  project: ApiProject,
): InfiniteData<PaginatedProjectList> {
  if (!prev.pages.length) return prev
  if (prev.pages.some((page) => page.results.some((row) => projectMatchesRow(project, row)))) {
    return prev
  }
  const [first, ...rest] = prev.pages
  const nextFirst = {
    ...first,
    count: first.count + 1,
    results: [project, ...first.results],
  }
  return { ...prev, pages: [nextFirst, ...rest] }
}

function isInfiniteProjectsList(raw: unknown): raw is InfiniteData<PaginatedProjectList> {
  return (
    typeof raw === 'object' &&
    raw !== null &&
    'pages' in raw &&
    Array.isArray((raw as InfiniteData<PaginatedProjectList>).pages)
  )
}

function isPaginatedProjectsList(raw: unknown): raw is PaginatedProjectList {
  return (
    typeof raw === 'object' &&
    raw !== null &&
    'results' in raw &&
    Array.isArray((raw as PaginatedProjectList).results)
  )
}

function patchListCache(raw: unknown, project: ApiProject, mode: 'remove' | 'prepend'): unknown {
  if (isInfiniteProjectsList(raw)) {
    return mode === 'remove'
      ? removeProjectFromInfiniteCache(raw, project)
      : prependProjectToInfiniteCache(raw, project)
  }

  if (isPaginatedProjectsList(raw)) {
    return mode === 'remove'
      ? removeProjectFromPaginatedCache(raw, project)
      : prependProjectToPaginatedCache(raw, project)
  }

  return raw
}

export interface PrependProjectToCachesOptions {
  /** Если задан — prepend только в board-колонку с этим API stage. */
  boardApiStage?: ProjectStageEnumKey
  /** Если false — не трогать календарь и прочие списки без board scope. По умолчанию true. */
  includeNonBoard?: boolean
}

function matchingProjectsListPredicate(
  queryKey: readonly unknown[],
  project: ApiProject,
  options: PrependProjectToCachesOptions,
): boolean {
  const { boardApiStage, includeNonBoard = true } = options
  const eventDate = project.event_date
  const params = listParamsFromQueryKey(queryKey)
  if (!eventDateMatchesListParams(eventDate, params)) return false

  const first = queryKey[0]
  if (isKanbanBoardQueryKey(first)) {
    if (boardApiStage === undefined) return false
    return first.apiStage === boardApiStage
  }

  return includeNonBoard
}

/** Добавить проект в подходящие кэши списков `/api/v1/projects/`. */
export function prependProjectToMatchingCaches(
  queryClient: QueryClient,
  project: ApiProject,
  options: PrependProjectToCachesOptions = {},
): void {
  forEachMatchingProjectsListQuery(
    queryClient,
    (queryKey) => matchingProjectsListPredicate(queryKey, project, options),
    (_queryKey, raw) => patchListCache(raw, project, 'prepend'),
  )
}

/** Убрать проект из подходящих кэшей списков `/api/v1/projects/`. */
export function removeProjectFromMatchingCaches(
  queryClient: QueryClient,
  project: ApiProject,
  options: PrependProjectToCachesOptions = {},
): void {
  forEachMatchingProjectsListQuery(
    queryClient,
    (queryKey) => matchingProjectsListPredicate(queryKey, project, options),
    (_queryKey, raw) => patchListCache(raw, project, 'remove'),
  )
}

function patchBoardColumn(
  queryClient: QueryClient,
  project: ApiProject,
  apiStage: ProjectStageEnumKey,
  mode: 'remove' | 'prepend',
): void {
  const eventDate = project.event_date

  forEachMatchingProjectsListQuery(
    queryClient,
    (queryKey) => {
      if (!matchesBoardColumn(queryKey, apiStage)) return false
      const params = listParamsFromQueryKey(queryKey)
      return eventDateMatchesListParams(eventDate, params)
    },
    (_queryKey, raw) => patchListCache(raw, project, mode),
  )
}

export interface MoveProjectInKanbanCacheInput {
  project: ApiProject
  fromApiStage: ProjectStageEnumKey
  toApiStage: ProjectStageEnumKey
}

export function moveProjectInKanbanCache(
  queryClient: QueryClient,
  { project, fromApiStage, toApiStage }: MoveProjectInKanbanCacheInput,
): void {
  if (fromApiStage !== toApiStage) {
    patchBoardColumn(queryClient, project, fromApiStage, 'remove')
  }
  patchBoardColumn(queryClient, project, toApiStage, 'prepend')
}

export function snapshotKanbanCaches(queryClient: QueryClient): KanbanCacheSnapshot {
  return queryClient
    .getQueriesData({
      predicate: (query) => isKanbanBoardQueryKey(query.queryKey[0]),
    })
    .map(([queryKey, data]) => [queryKey, data] as const)
}

export function restoreKanbanCaches(queryClient: QueryClient, snapshot: KanbanCacheSnapshot): void {
  for (const [queryKey, data] of snapshot) {
    queryClient.setQueryData(queryKey, data)
  }
}
