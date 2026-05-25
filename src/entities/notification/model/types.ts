import type { NotificationEventTypeEnumKey } from '@/shared/api/generated/types/Notification'

/** Уведомление для UI — тонкий слой поверх API Notification. */
export interface NotificationView {
  id: number
  eventType: NotificationEventTypeEnumKey
  title: string
  message: string
  projectId?: number
  projectTitle?: string
  createdAt: string
  isRead: boolean
  dotColor: string
}
