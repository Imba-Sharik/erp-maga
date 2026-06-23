import type { Reminder as ApiReminder } from '@/shared/api/generated/types/Reminder'
import { buildBusinessDatetime, formatBusinessDate, formatBusinessTime } from '@/shared/lib/date'

import type { Reminder } from '../model/types'

export function fromReminder(api: ApiReminder): Reminder {
  const date = api.reminder_datetime ? formatBusinessDate(api.reminder_datetime) : api.reminder_date
  const time = api.reminder_datetime ? formatBusinessTime(api.reminder_datetime) : api.reminder_time

  return {
    id: api.id,
    title: api.name,
    comment: api.comment,
    time,
    date,
    notifyTelegram: api.is_telegram_reminder,
    sentAt: api.sent_at,
    projectId: api.project_id,
  }
}

export function mapBackendCalendarReminders(list: readonly ApiReminder[]): Reminder[] {
  return list.map(fromReminder)
}

/**
 * Достаёт плоский список напоминаний из ответа `/reminders/`.
 * Схема описывает пагинацию двойне-вложенной (quirk бэка), поэтому
 * поддерживаем оба варианта: плоский `results: Reminder[]` и вложенный.
 */
export function extractRemindersList(data: { results?: unknown } | undefined): ApiReminder[] {
  const results = data?.results
  if (!Array.isArray(results)) return []
  const first = results[0] as { results?: unknown } | undefined
  if (first && Array.isArray(first.results)) {
    return (results as { results: ApiReminder[] }[]).flatMap((page) => page.results)
  }
  return results as ApiReminder[]
}

/** Минимальная API-форма для optimistic-обновлений кэша календаря. */
export function reminderToApiStub(reminder: Reminder): ApiReminder {
  return {
    id: reminder.id,
    // readOnly-поле с бэка; в оптимистичном стабе не используется (fromReminder его игнорирует), перезатрётся при рефетче
    user_id: 0,
    project_id: reminder.projectId ?? null,
    name: reminder.title,
    comment: reminder.comment,
    reminder_datetime: buildBusinessDatetime(reminder.date, reminder.time),
    reminder_date: reminder.date,
    reminder_time: reminder.time,
    is_telegram_reminder: reminder.notifyTelegram,
    sent_at: reminder.sentAt ?? null,
    created_at: '',
    updated_at: '',
  }
}
