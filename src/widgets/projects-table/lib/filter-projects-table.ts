import type { Project } from '@/entities/project'

import type { ProjectsTableColumnView } from './economics-columns'

/** Фильтры, живущие в шапке таблицы (по колонкам). */
export type ColumnFilterKey = 'loft' | 'hall' | 'manager' | 'stage'

export interface ColumnFilters {
  loft: string | null
  hall: string | null
  manager: string | null
  stage: string | null
  /** Коды статуса Plum (строки «1»…«14») — параметры `plum_event_status` / `plum_event_status__in` в API. */
  plumEventStatus: string[]
}

export const EMPTY_COLUMN_FILTERS: ColumnFilters = {
  loft: null,
  hall: null,
  manager: null,
  stage: null,
  plumEventStatus: [],
}

export interface ProjectsTableFilter {
  columns: ColumnFilters
  columnView?: ProjectsTableColumnView
  /** Клиентский фильтр по ФИО (архив закрытия на моках, пока нет API). */
  managerName?: string | null
  /** Клиентская фильтрация loft/hall (dev-моки вне MAG, API не вызывается). */
  clientSideLoftHall?: boolean
}

/**
 * Клиентская фильтрация: менеджер по ФИО (архив закрытия на моках), loft/hall для dev-моков.
 * Поиск по названию проекта — серверный (параметр `search` в запросе списка).
 * Фильтр «Отв. менеджер» на основных таблицах — через `mag_manager` в API.
 * LOFT/Зал — серверные (`hall_id`/`loft_id` в запросе), кроме dev-моков вне MAG.
 *
 * Фильтры «Этап проекта» и «Статус в PLUM» здесь НЕ участвуют — они в параметрах
 * запроса (`useProjectsTableQuery`), как и тумблер «Ожидают обработки» (`stage__in`).
 */
export function filterProjectsTable(projects: Project[], filter: ProjectsTableFilter): Project[] {
  const { columns } = filter
  const plumStatusCodes = columns.plumEventStatus
    .map((value) => Number(value))
    .filter((code) => Number.isFinite(code))

  return projects.filter((p) => {
    if (
      plumStatusCodes.length > 0 &&
      (p.plumEventStatus === null || !plumStatusCodes.includes(p.plumEventStatus))
    ) {
      return false
    }
    if (filter.clientSideLoftHall) {
      if (columns.loft && p.loft !== columns.loft) return false
      if (columns.hall && p.hall !== columns.hall) return false
    }
    if (filter.managerName && p.manager !== filter.managerName) return false
    return true
  })
}
