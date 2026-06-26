import { useMemo } from 'react'

import {
  filterAdminNotifications,
  useMarkNotificationRead,
  useNotifications,
} from '@/entities/notification'
import { useUserRole } from '@/entities/user-role'
import { groupByDay, toDayKey } from '@/shared/lib/date'

import { NotificationDaySection } from './notification-day-section'

export function NotificationsPage() {
  const role = useUserRole()
  const { notifications, isLoading, isError, refetch } = useNotifications()
  const { markRead } = useMarkNotificationRead()
  const visibleNotifications =
    role === 'admin' ? notifications.filter(filterAdminNotifications) : notifications

  const groupsByDay = useMemo(
    () => Array.from(groupByDay(visibleNotifications, (n) => toDayKey(new Date(n.createdAt)))),
    [visibleNotifications],
  )

  return (
    <div className="flex w-full max-w-4xl flex-col gap-6">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading text-foreground font-bold">Уведомления</h1>
          <p className="text-muted-foreground hidden max-w-[640px] text-sm md:block">
            События по проектам из вашего inbox. Новые записи создаёт сервер при действиях в
            воронке.
          </p>
        </div>
      </header>

      {isLoading && <p className="text-muted-foreground text-sm">Загрузка…</p>}

      {isError && (
        <div className="text-error flex flex-col gap-2 text-sm">
          <p>Не удалось загрузить уведомления.</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="text-info w-fit underline"
          >
            Повторить
          </button>
        </div>
      )}

      {!isLoading && !isError && visibleNotifications.length === 0 && (
        <p className="text-muted-foreground text-sm">
          Пока нет уведомлений. Они появятся, когда по вашим проектам произойдут события, на которые
          вы подписаны.
        </p>
      )}

      {!isLoading && !isError && visibleNotifications.length > 0 && (
        <div className="flex flex-col gap-5">
          {groupsByDay.map(([dayKey, dayNotifications]) => (
            <NotificationDaySection
              key={dayKey}
              notifications={dayNotifications}
              onRead={markRead}
            />
          ))}
        </div>
      )}
    </div>
  )
}
