import type { InfiniteData } from '@tanstack/react-query'
import { describe, expect, it } from 'vitest'

import type { Project as ApiProject } from '@/shared/api/generated/types/Project'
import type { PaginatedProjectList } from '@/shared/api/generated/types/PaginatedProjectList'

import { patchProjectInInfiniteCache, patchProjectInPaginatedCache } from './kanban-projects-cache'

function row(id: number, extra: Partial<ApiProject> = {}): ApiProject {
  return { id, plum_event_id: `ui-${id}`, event_name: `P${id}`, ...extra } as ApiProject
}

function page(results: ApiProject[]): PaginatedProjectList {
  return { count: results.length, next: null, previous: null, results }
}

describe('patchProjectInPaginatedCache', () => {
  it('заменяет строку по id, сохраняя позицию и count', () => {
    const prev = page([row(1), row(2)])
    const next = patchProjectInPaginatedCache(prev, row(2, { event_name: 'Updated' }))

    expect(next.results[1].event_name).toBe('Updated')
    expect(next.results[0].id).toBe(1)
    expect(next.count).toBe(2)
  })

  it('no-op (тот же ref), если строки нет в кэше', () => {
    const prev = page([row(1)])
    expect(patchProjectInPaginatedCache(prev, row(99))).toBe(prev)
  })
})

describe('patchProjectInInfiniteCache', () => {
  it('заменяет строку на нужной странице, не трогая остальные', () => {
    const prev: InfiniteData<PaginatedProjectList> = {
      pageParams: [],
      pages: [page([row(1)]), page([row(2)])],
    }
    const next = patchProjectInInfiniteCache(prev, row(2, { event_name: 'X' }))

    expect(next.pages[1].results[0].event_name).toBe('X')
    // Нетронутая страница остаётся тем же объектом — React Query не дёрнет лишний ререндер.
    expect(next.pages[0]).toBe(prev.pages[0])
  })

  it('no-op (тот же ref), если строки нет', () => {
    const prev: InfiniteData<PaginatedProjectList> = {
      pageParams: [],
      pages: [page([row(1)])],
    }
    expect(patchProjectInInfiniteCache(prev, row(99))).toBe(prev)
  })
})
