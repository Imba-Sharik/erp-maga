import { Link } from 'react-router-dom'

import { cn } from '@/shared/lib/utils'

import { formatNotificationClock, formatNotificationTime } from '../lib/format-notification-time'
import type { NotificationView } from '../model/types'

interface NotificationItemProps {
  notification: NotificationView
  /** Пометить прочитанным (вызывается при клике по уведомлению). */
  onRead?: (id: number) => void
  /**
   * Показывать относительную дату («Сегодня, 09:14»). Выключай, когда уведомления
   * сгруппированы по дням — день уже в заголовке группы, в элементе остаётся только время.
   */
  showDateLabel?: boolean
}

export function NotificationItem({
  notification,
  onRead,
  showDateLabel = true,
}: NotificationItemProps) {
  const { id, title, message, isRead, projectId, projectTitle, createdAt, dotColor } = notification

  const time = showDateLabel
    ? formatNotificationTime(createdAt)
    : formatNotificationClock(createdAt)
  const subtitle = [projectTitle, time].filter(Boolean).join(' · ')

  const content = (
    <>
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: dotColor, opacity: isRead ? 0.3 : 1 }}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={cn(
            'truncate text-sm',
            isRead ? 'font-normal text-[#6B6B6B]' : 'font-medium text-[#1B1A17]',
          )}
        >
          {title}
        </span>
        {(message || subtitle) && (
          <span className="line-clamp-2 text-xs text-[#ACACAC]">
            {message}
            {message && subtitle ? ' · ' : null}
            {subtitle}
          </span>
        )}
      </div>
    </>
  )

  const className = 'flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[#FAF9F6]'

  if (projectId != null) {
    return (
      <Link to={`/projects/${projectId}`} onClick={() => onRead?.(id)} className={className}>
        {content}
      </Link>
    )
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onRead?.(id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onRead?.(id)
        }
      }}
      className={cn(className, 'cursor-pointer')}
    >
      {content}
    </div>
  )
}
