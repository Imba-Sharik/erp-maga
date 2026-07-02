import { pluralizeRu } from '@/shared/lib/plural-ru'

export function pluralProjects(count: number): string {
  return pluralizeRu(count, ['проект', 'проекта', 'проектов'])
}

export function pluralHalls(count: number): string {
  return pluralizeRu(count, ['зал', 'зала', 'залов'])
}
