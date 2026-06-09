import { format, isValid, parseISO } from 'date-fns'

import { BUSINESS_TIMEZONE_OFFSET, businessTimezone } from '@/shared/config/business-timezone'

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

/** Дата yyyy-MM-dd в Europe/Moscow из ISO datetime API. */
export function formatBusinessDate(iso: string): string {
  if (!iso) return ''
  const parsed = parseISO(iso)
  if (!isValid(parsed)) return ''
  return format(parsed, 'yyyy-MM-dd', { in: businessTimezone })
}

/** Время HH:mm в Europe/Moscow из ISO datetime API. */
export function formatBusinessTime(iso: string): string {
  if (!iso) return ''
  const parsed = parseISO(iso)
  if (!isValid(parsed)) return ''
  return format(parsed, 'HH:mm', { in: businessTimezone })
}

/**
 * ISO datetime для API из настенных даты и времени в бизнес-таймзоне.
 * Пример: `2026-06-10` + `14:30` → `2026-06-10T14:30:00+03:00`
 */
export function buildBusinessDatetime(date: string, time: string): string {
  return `${date}T${time}:00${BUSINESS_TIMEZONE_OFFSET}`
}

export function parseBusinessDatetime(iso: string): { date: string; time: string } | null {
  if (!iso) return null
  const parsed = parseISO(iso)
  if (!isValid(parsed)) return null
  return {
    date: formatBusinessDate(iso),
    time: formatBusinessTime(iso),
  }
}

export function isBusinessDate(value: string): boolean {
  return DATE_PATTERN.test(value)
}

export function isBusinessTime(value: string): boolean {
  return TIME_PATTERN.test(value)
}
