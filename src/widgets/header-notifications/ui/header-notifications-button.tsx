import { Link } from 'react-router-dom'

import { BellIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

type HeaderNotificationsButtonProps = {
  className?: string
}

export function HeaderNotificationsButton({ className }: HeaderNotificationsButtonProps) {
  return (
    <Button variant="ghost" size="icon-sm" className={cn('text-foreground', className)} asChild>
      <Link to="/notifications" aria-label="Уведомления">
        <BellIcon className="size-5 shrink-0 [&_path]:stroke-current" />
      </Link>
    </Button>
  )
}
