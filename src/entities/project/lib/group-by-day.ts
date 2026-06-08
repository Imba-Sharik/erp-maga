import { groupByDay as groupByDayGeneric, toDayKey } from '@/shared/lib/date'

import type { Project } from '../model/types'

export type ProjectsByDay = Map<string, Project[]>

export { toDayKey }

export function groupByDay(projects: Project[]): ProjectsByDay {
  return groupByDayGeneric(projects, (p) => p.date)
}
