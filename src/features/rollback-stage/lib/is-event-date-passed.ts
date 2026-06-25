import { isValid, parseISO } from 'date-fns'

import type { Project } from '@/entities/project'

/**
 * Фактическая дата мероприятия (`project.date`) уже прошла относительно `now`.
 * Сравнение по календарной дате (без учёта времени): «сегодня» ещё не прошло.
 *
 * `now` параметризован ради детерминированных тестов.
 */
export function isEventDatePassed(project: Pick<Project, 'date'>, now: Date = new Date()): boolean {
  if (!project.date) return false
  const parsed = parseISO(project.date)
  if (!isValid(parsed)) return false
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return parsed < startOfToday
}
