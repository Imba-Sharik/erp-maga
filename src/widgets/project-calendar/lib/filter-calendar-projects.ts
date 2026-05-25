import { format } from 'date-fns'

import type { Project } from '@/entities/project'

export interface CalendarProjectsFilter {
  search: string
  hall: string | null
  loft: string | null
}

/**
 * Календарь оперирует лёгкими карточками из `/projects/calendar/`. С момента
 * перехода бэка на FK-поля `hall_name`/`loft_name` фильтры hall/loft мэтчатся
 * точным совпадением. Поиск — по `title` и `manager`. Прошедшие проекты
 * (event_date < сегодня) отбрасываются.
 */
export function filterCalendarProjects(
  projects: Project[],
  filter: CalendarProjectsFilter,
): Project[] {
  const search = filter.search.trim().toLowerCase()
  // ISO yyyy-MM-dd сравниваются как строки в правильном хронологическом порядке.
  const todayKey = format(new Date(), 'yyyy-MM-dd')
  return projects.filter((p) => {
    if (p.date && p.date < todayKey) return false
    if (filter.hall && p.hall !== filter.hall) return false
    if (filter.loft && p.loft !== filter.loft) return false
    if (search) {
      const haystack = `${p.title} ${p.manager}`.toLowerCase()
      if (!haystack.includes(search)) return false
    }
    return true
  })
}
