import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { Reminder } from './types'

const REMINDERS_STORAGE_KEY = 'mag-erp-reminders'

/**
 * Локальный стор напоминаний с persist.
 *
 * Бэка под напоминания пока нет — храним фронтовый мок в localStorage,
 * чтобы напоминания переживали перезагрузку и были общими между календарём
 * встреч и табом «Напоминания» внутри проекта. Когда появится API,
 * меняются только тела экшенов (mutate вместо set).
 */
interface ReminderState {
  reminders: Reminder[]
  addReminder: (input: Omit<Reminder, 'id'>) => void
  updateReminder: (id: number, patch: Partial<Omit<Reminder, 'id'>>) => void
  removeReminder: (id: number) => void
}

export const useReminderStore = create<ReminderState>()(
  persist(
    (set) => ({
      reminders: [],
      addReminder: (input) =>
        set((s) => ({
          reminders: [...s.reminders, { ...input, id: Date.now() }],
        })),
      updateReminder: (id, patch) =>
        set((s) => ({
          reminders: s.reminders.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),
      removeReminder: (id) =>
        set((s) => ({
          reminders: s.reminders.filter((r) => r.id !== id),
        })),
    }),
    { name: REMINDERS_STORAGE_KEY },
  ),
)

/** Неподписочный доступ — для колбэков вне рендера. */
export const reminderActions = {
  add: (input: Omit<Reminder, 'id'>): void => useReminderStore.getState().addReminder(input),
  update: (id: number, patch: Partial<Omit<Reminder, 'id'>>): void =>
    useReminderStore.getState().updateReminder(id, patch),
  remove: (id: number): void => useReminderStore.getState().removeReminder(id),
}

/** Все напоминания (реактивно). Фильтрацию консьюмеры делают через useMemo. */
export const useReminders = (): Reminder[] => useReminderStore((s) => s.reminders)
