import { notificationsListQueryOptions } from '@/shared/api/generated/hooks/notificationsController/useNotificationsList'

export { notificationsListQueryKey } from '@/shared/api/generated/hooks/notificationsController/useNotificationsList'

/** Интервал поллинга и staleTime для inbox уведомлений. */
export const NOTIFICATIONS_STALE_TIME = 10_000

const notificationsOverrides = {
  staleTime: NOTIFICATIONS_STALE_TIME,
  refetchInterval: NOTIFICATIONS_STALE_TIME,
  refetchIntervalInBackground: true,
} as const

export function notificationsQueryOptions() {
  return {
    ...notificationsListQueryOptions(),
    ...notificationsOverrides,
  }
}
