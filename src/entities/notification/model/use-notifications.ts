import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { fromNotification } from '../lib/from-notification'
import { notificationsQueryOptions } from '../lib/notifications-query'
import type { NotificationView } from './types'

export function useNotifications() {
  const query = useQuery(notificationsQueryOptions())

  const notifications = useMemo(
    () => (query.data ?? []).map(fromNotification),
    [query.data],
  )

  return {
    notifications,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useUnreadNotificationCount(): number {
  const { notifications } = useNotifications()
  return notifications.reduce((acc, n) => acc + (n.isRead ? 0 : 1), 0)
}

export type { NotificationView }
