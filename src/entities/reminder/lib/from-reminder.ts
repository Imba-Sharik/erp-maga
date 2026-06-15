import type { Reminder as ApiReminder } from '@/shared/api/generated/types/Reminder'
import {
  buildBusinessDatetime,
  formatBusinessDate,
  formatBusinessTime,
} from '@/shared/lib/date/business-datetime'

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
    projectId: null,
  }
}

export function mapBackendCalendarReminders(list: readonly ApiReminder[]): Reminder[] {
  return list.map(fromReminder)
}

/** Минимальная API-форма для optimistic-обновлений кэша календаря. */
export function reminderToApiStub(reminder: Reminder): ApiReminder {
  return {
    id: reminder.id,
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
