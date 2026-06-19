import type { Project } from '@/entities/project'

export interface CalendarProjectsFilter {
  search: string
  /** Выбранные залы (мультивыбор): проект проходит, если совпал хотя бы с одним. */
  hall: string[]
  loft: string | null
  /** Коды статуса Plum (строки «1»…«14»). */
  plumEventStatus: string[]
}

/**
 * Календарь оперирует лёгкими карточками из `/projects/calendar/` — у них нет
 * `loft`/`hall` по отдельности (только слитая строка `hallLoft`) и нет
 * `company`/`phone`/`email`. Поэтому:
 * - hall/loft-фильтры мэтчатся подстрокой против `hallLoft`; для зала выбор
 *   множественный, проект проходит при совпадении хотя бы с одним из залов
 * - поиск идёт только по `title` и `manager`
 *
 * Прошедшие проекты НЕ отбрасываются — календарь показывает весь видимый
 * месяц целиком (бэк уже отдаёт диапазон с начала сетки месяца).
 */
export function filterCalendarProjects(
  projects: Project[],
  filter: CalendarProjectsFilter,
): Project[] {
  const search = filter.search.trim().toLowerCase()
  const halls = filter.hall.map((value) => value.toLowerCase())
  const plumStatusCodes = filter.plumEventStatus
    .map((value) => Number(value))
    .filter((code) => Number.isFinite(code))

  return projects.filter((p) => {
    const venue = (p.hallLoft || `${p.loft} ${p.hall}`).toLowerCase()
    if (halls.length > 0 && !halls.some((hall) => venue.includes(hall))) return false
    if (filter.loft && !venue.includes(filter.loft.toLowerCase())) return false
    if (
      plumStatusCodes.length > 0 &&
      (p.plumEventStatus === null || !plumStatusCodes.includes(p.plumEventStatus))
    ) {
      return false
    }
    if (search) {
      const haystack = `${p.title} ${p.manager}`.toLowerCase()
      if (!haystack.includes(search)) return false
    }
    return true
  })
}
