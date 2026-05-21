import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { AppNotification } from './types'

const NOTIFICATIONS_STORAGE_KEY = 'mag-erp-notifications'

interface NotificationState {
  notifications: AppNotification[]
  /** Добавить уведомление (id/createdAt/read проставляются автоматически). */
  push: (input: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void
  markRead: (id: string) => void
}

/**
 * Стор уведомлений с persist в localStorage. Persist обязателен: уведомление
 * создаёт одна роль (например, бухгалтер), а читает другая (руководитель) —
 * между ними обычно перезагрузка/смена сессии. In-memory стор такое не переживёт.
 */
export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      push: (input) =>
        set((s) => ({
          notifications: [
            {
              ...input,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              read: false,
            },
            ...s.notifications,
          ],
        })),
      markRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
    }),
    { name: NOTIFICATIONS_STORAGE_KEY },
  ),
)

export const useNotifications = () => useNotificationStore((s) => s.notifications)
