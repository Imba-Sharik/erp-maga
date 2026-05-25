import type { Notification } from '@/shared/api/generated/types/Notification'

import { getEventTypeDotColor } from './event-type-meta'
import { parseNotificationPayload } from './parse-notification-payload'
import type { NotificationView } from '../model/types'

export function fromNotification(notification: Notification): NotificationView {
  const { projectId, projectTitle } = parseNotificationPayload(notification.payload)

  return {
    id: notification.id,
    eventType: notification.event_type,
    title: notification.title,
    message: notification.message,
    projectId,
    projectTitle,
    createdAt: notification.created_at,
    isRead: notification.read_at != null,
    dotColor: getEventTypeDotColor(notification.event_type),
  }
}
