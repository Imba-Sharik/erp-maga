import type { Project } from '@/entities/project'

export interface ProjectsFilter {
  search: string
  city: string | null
  hall: string | null
  loft: string | null
}

export function filterProjects(projects: Project[], filter: ProjectsFilter): Project[] {
  const search = filter.search.trim().toLowerCase()
  return projects.filter((p) => {
    if (filter.city && p.city !== filter.city) return false
    if (search) {
      const haystack = `${p.title} ${p.company} ${p.manager} ${p.phone} ${p.email}`.toLowerCase()
      if (!haystack.includes(search)) return false
    }
    return true
  })
}
