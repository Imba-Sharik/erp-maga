export interface Reminder {
  id: number
  title: string
  comment: string
  /** Время в формате HH:mm */
  time: string
  /** Дата в формате yyyy-MM-dd */
  date: string
  /** Дублировать уведомление в Telegram (по умолчанию уведы приходят только в ЕРП) */
  notifyTelegram: boolean
  /** Менеджер-владелец напоминания */
  managerId: number
  /** Привязка к проекту: null — напоминание создано из календаря встреч */
  projectId: number | null
}

export type RemindersByDay = Map<string, Reminder[]>
