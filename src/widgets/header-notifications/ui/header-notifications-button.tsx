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
      className={cn('relative text-foreground', className)}
      asChild
    >
      <Link to="/notifications" aria-label="Уведомления">
        <BellIcon className="size-5 shrink-0 [&_path]:stroke-current" />
        {unreadCount > 0 && (
          <span className="text-2xs absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#D25252] px-1 leading-none font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>
    </Button>
  )
}
