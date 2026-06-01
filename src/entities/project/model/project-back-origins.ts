import type { ProjectBackOrigin } from './types'

export const DEFAULT_PROJECTS_BACK_ORIGIN: ProjectBackOrigin = {
  to: '/projects',
  label: 'Все проекты',
}

export const CLOSING_BACK_ORIGIN: ProjectBackOrigin = {
  to: '/closing',
  label: 'Закрытие',
}

export const REQUESTS_BACK_ORIGIN: ProjectBackOrigin = {
  to: '/requests',
  label: 'Запросы',
}

export const CLOSED_REQUESTS_BACK_ORIGIN: ProjectBackOrigin = {
  to: '/closed-requests',
  label: 'Закрытые запросы',
}

export function resolveProjectBackFromPathname(pathname: string): ProjectBackOrigin {
  if (pathname.startsWith('/closing/')) return CLOSING_BACK_ORIGIN
  return DEFAULT_PROJECTS_BACK_ORIGIN
}

export function resolveRequestBackFromPathname(pathname: string): ProjectBackOrigin {
  if (pathname.startsWith('/closed-requests/')) return CLOSED_REQUESTS_BACK_ORIGIN
  return REQUESTS_BACK_ORIGIN
}
