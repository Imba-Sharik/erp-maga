import { Link } from 'react-router-dom'

import { cn } from '@/shared/lib/utils'

import { NOTIFICATION_CHANNEL_LABELS } from '../lib/channels'
import { formatNotificationTime } from '../lib/format-notification-time'
import { getStageNotification } from '../lib/stage-notifications'
import type { AppNotification } from '../model/types'

interface NotificationItemProps {
  notification: AppNotification
  /** Пометить прочитанным (вызывается при клике по уведомлению). */
  onRead?: (id: string) => void
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const def = getStageNotification(notification.stage)
  const title = def?.title ?? 'Уведомление'
  const dotColor = def?.dotColor ?? '#ACACAC'
  const { read, projectTitle, createdAt, channels } = notification

  return (
    <Link
      to={`/projects/${notification.projectId}`}
      onClick={() => onRead?.(notification.id)}
      className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[#FAF9F6]"
    >
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: dotColor, opacity: read ? 0.3 : 1 }}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={cn(
            'truncate text-sm',
            read ? 'font-normal text-[#6B6B6B]' : 'font-medium text-[#1B1A17]',
          )}
        >
          {title}
        </span>
        <span className="truncate text-xs text-[#ACACAC]">
          {projectTitle} · {formatNotificationTime(createdAt)}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {channels.map((ch) => (
          <span
            key={ch}
            className="text-2xs rounded-md border border-[#E9E6DD] bg-[#F4F2EC] px-2 py-0.5 font-medium text-[#6B6B6B]"
          >
            {NOTIFICATION_CHANNEL_LABELS[ch]}
          </span>
        ))}
      </div>
    </Link>
  )
}
