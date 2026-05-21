import type { ProjectStage } from '@/entities/project'

/** Роль-адресат уведомления. */
export type NotificationRecipient = 'accountant' | 'director'

/** Канал доставки. ERP — внутри системы, Telegram — пуш (пока заглушка под будущую интеграцию). */
export type NotificationChannel = 'erp' | 'telegram'

/**
 * Уведомление. Моковая сущность: создаётся локально при переходе проекта
 * на этап, требующий действия от конкретной роли.
 */
export interface AppNotification {
  id: string
  /** Этап, на который перешёл проект (определяет текст и цвет уведомления). */
  stage: ProjectStage
  /** Кому адресовано уведомление. */
  recipient: NotificationRecipient
  /** Каналы доставки (пока всегда `['erp']`). */
  channels: NotificationChannel[]
  projectId: number | string
  projectTitle: string
  /** ISO-datetime создания. */
  createdAt: string
  read: boolean
}
