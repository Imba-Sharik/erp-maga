import { format } from 'date-fns'
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
  const prefix = `${format(month, 'yyyy-MM')}-`
  let total = 0
  for (const [key, projects] of projectsByDay) {
    if (key.startsWith(prefix)) total += projects.length
  }
  return total
}
