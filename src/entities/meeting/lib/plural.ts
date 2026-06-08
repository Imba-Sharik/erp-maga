import { pluralizeRu } from '@/shared/lib/plural-ru'

export function pluralMeetings(count: number): string {
  return pluralizeRu(count, ['встреча', 'встречи', 'встреч'])
}
