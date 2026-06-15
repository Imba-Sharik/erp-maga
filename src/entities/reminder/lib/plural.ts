import { pluralizeRu } from '@/shared/lib/plural-ru'

export function pluralReminders(count: number): string {
  return pluralizeRu(count, ['напоминание', 'напоминания', 'напоминаний'])
}
