import { useMemo } from 'react'

import { useUserRole } from '@/entities/user-role'

import { useNotifications } from '../model/store'
import type { AppNotification } from '../model/types'

/** Уведомления, адресованные текущей роли пользователя. */
export function useRoleNotifications(): AppNotification[] {
  const role = useUserRole()
  const all = useNotifications()
  return useMemo(() => all.filter((n) => n.recipient === role), [all, role])
}

/** Количество непрочитанных уведомлений для текущей роли. */
export function useUnreadNotificationCount(): number {
  return useRoleNotifications().reduce((acc, n) => acc + (n.read ? 0 : 1), 0)
}
