import type { Project } from '@/entities/project'

import type { ProjectsTableColumnView } from './economics-columns'

/** Фильтры, живущие в шапке таблицы (по колонкам). */
export type ColumnFilterKey = 'loft' | 'hall' | 'manager' | 'stage' | 'plumEventStatus'

export interface ColumnFilters {
  loft: string | null
  hall: string | null
  manager: string | null
  stage: string | null
  /** Код статуса Plum (строка «1»…«14») — параметр `plum_event_status` в API. */
  plumEventStatus: string | null
}

export const EMPTY_COLUMN_FILTERS: ColumnFilters = {
  loft: null,
  hall: null,
  manager: null,
  stage: null,
  plumEventStatus: null,
}

export interface ProjectsTableFilter {
  columns: ColumnFilters
  columnView?: ProjectsTableColumnView
  /** Клиентский фильтр по ФИО (архив закрытия на моках, пока нет API). */
  managerName?: string | null
}

/**
 * Клиентская фильтрация: LOFT/Зал (+ менеджер только для архива на моках).
 * Поиск по названию проекта — серверный (параметр `search` в запросе списка).
 * Фильтр «Отв. менеджер» на основных таблицах — через `mag_manager` в API.
 *
 * Фильтры «Этап проекта» и «Статус в PLUM» здесь НЕ участвуют — они в параметрах
 * запроса (см. хуки списков), как и тумблер «Ожидают обработки».
 */
export function filterProjectsTable(projects: Project[], filter: ProjectsTableFilter): Project[] {
  const { columns, columnView = 'general' } = filter
  const plumStatusCode = columns.plumEventStatus !== null ? Number(columns.plumEventStatus) : null

  return projects.filter((p) => {
    if (plumStatusCode !== null && p.plumEventStatus !== plumStatusCode) return false
    if (
      columnView === 'general' ||
      columnView === 'outside-mag' ||
      columnView === 'closing-general'
    ) {
      if (columns.loft && p.loft !== columns.loft) return false
      if (columns.hall && p.hall !== columns.hall) return false
    }
    if (filter.managerName && p.manager !== filter.managerName) return false
    return true
  })
}
