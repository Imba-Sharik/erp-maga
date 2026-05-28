import { format, isValid, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'

/** Абсолютные дата и время: `12.05.2024, 14:30`. Пустую/невалидную строку → ''. */
export function formatDateTime(iso: string): string {
  if (!iso) return ''
  const value = parseISO(iso)
  if (!isValid(value)) return ''
  return format(value, 'dd.MM.yyyy, HH:mm', { locale: ru })
}
