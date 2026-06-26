/**
 * Тип события календаря — общий для встреч и напоминаний (ERP-215).
 * Бэк поля пока не хранит: селект собирается формой, но в запрос не уходит
 * (см. `toMeetingCreateRequest` / `toReminderCreateRequest`).
 */
export type CalendarEventType =
  | 'meeting'
  | 'assembly'
  | 'event'
  | 'day_off'
  | 'vacation'
  | 'out_of_office'

export type CalendarEventTypeOption = {
  readonly value: CalendarEventType
  readonly label: string
}

export const CALENDAR_EVENT_TYPE_OPTIONS: readonly CalendarEventTypeOption[] = [
  { value: 'meeting', label: 'Встреча' },
  { value: 'assembly', label: 'Монтаж' },
  { value: 'event', label: 'Мероприятие' },
  { value: 'day_off', label: 'Выходной' },
  { value: 'vacation', label: 'Отпуск' },
  { value: 'out_of_office', label: 'Отсутствие в офисе' },
] as const

export function getCalendarEventTypeLabel(value: string): string | undefined {
  return CALENDAR_EVENT_TYPE_OPTIONS.find((o) => o.value === value)?.label
}
