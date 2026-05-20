import type { Project } from '@/entities/project'

import type { ProjectsTableColumnView } from './economics-columns'

/** Фильтры, живущие в шапке таблицы (по колонкам). */
export type ColumnFilterKey = 'loft' | 'hall' | 'manager' | 'stage'

export interface ColumnFilters {
  loft: string | null
  hall: string | null
  manager: string | null
  stage: string | null
}

export const EMPTY_COLUMN_FILTERS: ColumnFilters = {
  loft: null,
  hall: null,
  manager: null,
  stage: null,
}

export interface ProjectsTableFilter {
  search: string
  columns: ColumnFilters
  columnView?: ProjectsTableColumnView
}

/**
 * Клиентская фильтрация: поиск + LOFT/Зал/Менеджер.
 * У бэка нет параметров под эти три поля и под `search`, поэтому они применяются
 * на фронте поверх загруженных страниц.
 *
 * Фильтр «Этап проекта» здесь НЕ участвует — этап всегда параметр запроса
 * (см. `useProjectsTableQuery`), как и тумблер «Ожидают обработки».
 */
export function filterProjectsTable(projects: Project[], filter: ProjectsTableFilter): Project[] {
  const search = filter.search.trim().toLowerCase()
  const { columns, columnView = 'general' } = filter

  return projects.filter((p) => {
    if (columnView === 'general' || columnView === 'outside-mag') {
      if (columns.loft && p.loft !== columns.loft) return false
      if (columns.hall && p.hall !== columns.hall) return false
    }
    if (columns.manager && p.manager !== columns.manager) return false
    if (search) {
      const haystack = `${p.title} ${p.company} ${p.manager} ${p.phone} ${p.email}`.toLowerCase()
      if (!haystack.includes(search)) return false
    }
    return true
  })
}
