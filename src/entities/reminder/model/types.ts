export interface Reminder {
  id: number
  /** Владелец напоминания (user_id с бэка). Нужен для фильтра по менеджеру у Руководителя. */
  managerId: number
  title: string
  /** Тип события (ERP-215): meeting/installation/event/day_off/vacation/out_of_office; '' если не задан. */
  eventType: string
  comment: string
  /** Время в формате HH:mm */
  time: string
  /** Дата в формате yyyy-MM-dd */
  date: string
  /** Дублировать уведомление в Telegram (по умолчанию уведы приходят только в ЕРП) */
  notifyTelegram: boolean
  /** Время отправки уведомления (с бэка); null — ещё не отправлено. Отправленные нельзя править/удалять */
  sentAt?: string | null
  /**
   * Привязка к проекту — только для локальных «проектных» напоминаний.
   * Бэка под проектные напоминания пока нет, поэтому поле живёт лишь во фронтовом сторе.
   */
  projectId?: number | null
}

export type RemindersByDay = Map<string, Reminder[]>

export interface ListRemindersParams {
  /** yyyy-MM-dd — начало периода */
  dateFrom: string
  /** yyyy-MM-dd — конец периода */
  dateTo: string
}
