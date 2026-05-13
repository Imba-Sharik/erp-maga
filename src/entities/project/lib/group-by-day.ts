import type { Project } from '../model/types'

export type ProjectsByDay = Map<string, Project[]>

export function groupByDay(projects: Project[]): ProjectsByDay {
  const map: ProjectsByDay = new Map()
  for (const p of projects) {
    const list = map.get(p.date)
    if (list) list.push(p)
    else map.set(p.date, [p])
  }
  return map
}

export function pluralProjects(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return `${count} проект`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} проекта`
  return `${count} проектов`
}
