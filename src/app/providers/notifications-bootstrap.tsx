import { useQuery } from '@tanstack/react-query'

import { notificationsQueryOptions } from '@/entities/notification'

/** Прогрев кэша и поллинг inbox, пока пользователь в приложении. */
export function NotificationsBootstrap() {
  useQuery(notificationsQueryOptions())
  return null
}
