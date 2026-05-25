import { format } from 'date-fns'

import type { Project } from '@/entities/project'

export interface CalendarProjectsFilter {
  search: string
  hall: string | null
  loft: string | null
}

/**
 * Календарь оперирует лёгкими карточками из `/projects/calendar/` — у них нет
 * `loft`/`hall` по отдельности (только слитая строка `hallLoft`) и нет
 * `company`/`phone`/`email`. Поэтому:
 * - hall/loft-фильтры мэтчатся подстрокой против `hallLoft`
 * - поиск идёт только по `title` и `manager`
 * - прошедшие проекты (event_date < сегодня) отбрасываются
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
    const venue = (p.hallLoft || `${p.loft} ${p.hall}`).toLowerCase()
    if (filter.hall && !venue.includes(filter.hall.toLowerCase())) return false
    if (filter.loft && !venue.includes(filter.loft.toLowerCase())) return false
    if (search) {
      const haystack = `${p.title} ${p.manager}`.toLowerCase()
      if (!haystack.includes(search)) return false
    }
    return true
  })
}
