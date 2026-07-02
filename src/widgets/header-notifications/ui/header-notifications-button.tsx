import { Link } from 'react-router-dom'

import { useUnreadNotificationCount } from '@/entities/notification'
import { BellIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

type HeaderNotificationsButtonProps = {
  className?: string
}

export function HeaderNotificationsButton({ className }: HeaderNotificationsButtonProps) {
  const unreadCount = useUnreadNotificationCount()

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={cn(
        'border-border-medium bg-card text-foreground-soft hover:bg-surface-muted relative size-7.5 rounded-[10px] border',
        className,
      )}
      asChild
    >
      <Link
        to="/notifications"
        aria-label={unreadCount > 0 ? `Уведомления: непрочитанных ${unreadCount}` : 'Уведомления'}
      >
        <BellIcon className="size-4 shrink-0 [&_path]:stroke-current" />
        {unreadCount > 0 && (
          <span className="bg-error ring-card absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-0.5 text-3xs leading-none font-semibold text-white ring-2">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>
    </Button>
  )
}
