import {
  filterAdminNotifications,
  NotificationItem,
  useMarkNotificationRead,
  useNotifications,
} from '@/entities/notification'
import { useUserRole } from '@/entities/user-role'

export function NotificationsPage() {
  const role = useUserRole()
  const { notifications, isLoading, isError, refetch } = useNotifications()
  const { markRead } = useMarkNotificationRead()
  const visibleNotifications =
    role === 'admin' ? notifications.filter(filterAdminNotifications) : notifications

  return (
    <div className="flex w-full max-w-4xl flex-col gap-6">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading font-bold text-[#1B1A17]">Уведомления</h1>
          <p className="max-w-[640px] text-sm text-[#ACACAC]">
            События по проектам из вашего inbox. Новые записи создаёт сервер при действиях в
            воронке.
          </p>
        </div>
      </header>

      {isLoading && <p className="text-sm text-[#ACACAC]">Загрузка…</p>}

      {isError && (
        <div className="flex flex-col gap-2 text-sm text-[#D25252]">
          <p>Не удалось загрузить уведомления.</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="w-fit text-[#4B61B9] underline"
          >
            Повторить
          </button>
        </div>
      )}

      {!isLoading && !isError && visibleNotifications.length === 0 && (
        <p className="text-sm text-[#ACACAC]">
          Пока нет уведомлений. Они появятся, когда по вашим проектам произойдут события, на которые
          вы подписаны.
        </p>
      )}

      {!isLoading && !isError && visibleNotifications.length > 0 && (
        <div className="divide-y divide-[#F0F0F0] overflow-hidden rounded-[14px] border border-[#E9E6DD] bg-white">
          {visibleNotifications.map((n) => (
            <NotificationItem key={n.id} notification={n} onRead={markRead} />
          ))}
        </div>
      )}
    </div>
  )
}
