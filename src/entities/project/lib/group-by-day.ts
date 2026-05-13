import { format } from 'date-fns'
import type { Project } from '../model/types'

export type ProjectsByDay = Map<string, Project[]>

export function toDayKey(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function groupByDay(projects: Project[]): ProjectsByDay {
  const map: ProjectsByDay = new Map()
  for (const p of projects) {
    const list = map.get(p.date)
    if (list) list.push(p)
    else map.set(p.date, [p])
  }
  return map
}
