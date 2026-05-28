import type { NotificationView } from '../model/types'

const ADMIN_NOTIFICATION_PHRASES = ['удален', 'удалён', 'новый пользователь']

export function filterAdminNotifications(notification: NotificationView): boolean {
  // TODO: Переключиться на фильтрацию по eventType после появления типов
  // вроде project_deleted/user_created в API.
  if (notification.eventType !== 'other') {
    return true
  }

  const haystack = `${notification.title} ${notification.message}`.toLowerCase()
  return ADMIN_NOTIFICATION_PHRASES.some((phrase) => haystack.includes(phrase))
}
