import {
  differenceInCalendarDays,
  differenceInHours,
  differenceInMinutes,
  format,
  isValid,
  isYesterday,
  parseISO,
} from 'date-fns'

/**
 * Кастомный формат относительного времени обновления:
 * - < 60 минут: `Nм назад` (минимум 1м)
 * - сегодня >= 60 минут: `Nч назад`
 * - вчера (календарно): `Вчера в HH:mm`
 * - 2+ календарных дня: `Nд назад`
 */
export function formatRelativeUpdateLabel(iso: string, now: Date = new Date()): string {
  if (!iso) return ''

  const value = parseISO(iso)
  if (!isValid(value)) return ''
  if (value.getTime() > now.getTime()) return ''

  if (isYesterday(value)) return `Вчера в ${format(value, 'HH:mm')}`

  const days = differenceInCalendarDays(now, value)
  if (days >= 2) return `${days}д назад`

  const minutes = differenceInMinutes(now, value)
  if (minutes < 60) return `${Math.max(1, minutes)}м назад`

  const hours = differenceInHours(now, value)
  return `${Math.max(1, hours)}ч назад`
}
