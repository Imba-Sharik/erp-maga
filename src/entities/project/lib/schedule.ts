import { countItemsInMonth } from '@/shared/lib/date'

import type { Project } from '../model/types'
import { toDayKey, type ProjectsByDay } from './group-by-day'

export interface ScheduleDayRow {
  date: Date
  key: string
  projects: Project[]
}

export function getProjectsForDates(projectsByDay: ProjectsByDay, dates: Date[]): ScheduleDayRow[] {
  return [...dates]
    .sort((a, b) => a.getTime() - b.getTime())
    .map((date) => {
      const key = toDayKey(date)
      return { date, key, projects: projectsByDay.get(key) ?? [] }
    })
}

export function countProjectsInMonth(projectsByDay: ProjectsByDay, month: Date): number {
  return countItemsInMonth(projectsByDay, month)
}
