import { countItemsInMonth, groupByDay, toDayKey } from '@/shared/lib/date'

import type { Reminder, RemindersByDay } from '../model/types'

export function groupRemindersByDay(reminders: Reminder[]): RemindersByDay {
  return groupByDay(reminders, (reminder) => reminder.date)
}

export function countRemindersInMonth(remindersByDay: RemindersByDay, month: Date): number {
  return countItemsInMonth(remindersByDay, month)
}

export function getRemindersForDate(remindersByDay: RemindersByDay, date: Date): Reminder[] {
  return remindersByDay.get(toDayKey(date)) ?? []
}

/** Сортировка по времени — для списков в панели дня и в проекте. */
export function sortRemindersByTime(reminders: Reminder[]): Reminder[] {
  return [...reminders].sort((a, b) => a.time.localeCompare(b.time))
}
