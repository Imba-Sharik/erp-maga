import { useState } from 'react'

import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_CHANNEL_LABELS,
  NotificationItem,
  useNotificationStore,
  useRoleNotifications,
  type NotificationChannel,
} from '@/entities/notification'

export function NotificationsPage() {
  const notifications = useRoleNotifications()
  const markRead = useNotificationStore((s) => s.markRead)
  const [channelFilter, setChannelFilter] = useState<Record<NotificationChannel, boolean>>({
    erp: true,
    telegram: true,
  })

  const visible = notifications.filter((n) => n.channels.some((c) => channelFilter[c]))

  return (
    <div className="flex w-full max-w-4xl flex-col gap-6">
      <header className="flex shrink-0 flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-heading font-bold text-[#1B1A17]">Уведомления</h1>
          <p className="max-w-[640px] text-sm text-[#ACACAC]">
            События по проектам. Канал ERP — внутри системы, Telegram — пуш-сообщения.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {NOTIFICATION_CHANNELS.map((ch) => (
            <label
              key={ch}
              className="flex cursor-pointer items-center gap-1.5 text-sm text-[#454545] select-none"
            >
              <input
                type="checkbox"
                checked={channelFilter[ch]}
                onChange={(e) => setChannelFilter((prev) => ({ ...prev, [ch]: e.target.checked }))}
                className="size-4 cursor-pointer rounded accent-[#1B1A17]"
              />
              {NOTIFICATION_CHANNEL_LABELS[ch]}
            </label>
          ))}
        </div>
      </header>

      {visible.length === 0 ? (
        <p className="text-sm text-[#ACACAC]">
          {notifications.length === 0
            ? 'Пока нет уведомлений. Они появятся, когда проект дойдёт до этапа, требующего вашего действия.'
            : 'Нет уведомлений по выбранным каналам.'}
        </p>
      ) : (
        <div className="divide-y divide-[#F0F0F0] overflow-hidden rounded-[14px] border border-[#E9E6DD] bg-white">
          {visible.map((n) => (
            <NotificationItem key={n.id} notification={n} onRead={markRead} />
          ))}
        </div>
      )}
    </div>
  )
}
