import { pluralizeRu } from '@/shared/lib/plural-ru'

export function pluralProjects(count: number): string {
  return pluralizeRu(count, ['проект', 'проекта', 'проектов'])
}
