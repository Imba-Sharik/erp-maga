import { DEFAULT_PROJECTS_BACK_ORIGIN } from '../model/project-back-origins'
import type { ProjectBackOrigin } from '../model/types'

const DETAIL_PREFIX_BY_LIST: Record<string, string> = {
  '/closing': '/closing',
  '/closed-projects': '/closing',
  '/outside-mag': '/outside-mag',
  '/projects': '/projects',
  '/requests': '/requests',
  '/closed-requests': '/closed-requests',
}

export function projectDetailPath(id: string | number, backOrigin?: ProjectBackOrigin): string {
  const listRoute = backOrigin?.to ?? DEFAULT_PROJECTS_BACK_ORIGIN.to
  const prefix = DETAIL_PREFIX_BY_LIST[listRoute] ?? '/projects'
  return `${prefix}/${id}`
}
