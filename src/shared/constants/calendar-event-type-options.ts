/**
 * Тип события календаря — общий для встреч и напоминаний (ERP-215).
 * Значения совпадают с enum бэка (`type` на встречах/напоминаниях).
 */
export type CalendarEventType =
  | 'meeting'
  | 'installation'
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
  { value: 'installation', label: 'Монтаж' },
  { value: 'event', label: 'Мероприятие' },
  { value: 'day_off', label: 'Выходной' },
  { value: 'vacation', label: 'Отпуск' },
  { value: 'out_of_office', label: 'Отсутствие в офисе' },
] as const

export function getCalendarEventTypeLabel(value: string): string | undefined {
  return CALENDAR_EVENT_TYPE_OPTIONS.find((o) => o.value === value)?.label
}

/**
 * Пастельный тон тега для каждого типа события (ERP-237). Через семантические
 * токены `--event-*` (theme.css); как статусы — не темнеют в тёмной теме.
 */
export const CALENDAR_EVENT_TYPE_TAG_CLASS: Record<CalendarEventType, string> = {
  meeting: 'bg-event-meeting-surface text-event-meeting border-event-meeting-border',
  installation:
    'bg-event-installation-surface text-event-installation border-event-installation-border',
  event: 'bg-event-activity-surface text-event-activity border-event-activity-border',
  day_off: 'bg-event-day-off-surface text-event-day-off border-event-day-off-border',
  vacation: 'bg-event-vacation-surface text-event-vacation border-event-vacation-border',
  out_of_office:
    'bg-event-out-of-office-surface text-event-out-of-office border-event-out-of-office-border',
}

export function getCalendarEventTypeTagClass(value: string): string | undefined {
  return CALENDAR_EVENT_TYPE_TAG_CLASS[value as CalendarEventType]
}
