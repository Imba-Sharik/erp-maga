import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'

interface TableIconActionButtonProps {
  icon: ReactNode
  'aria-label': string
  onClick?: () => void
  disabled?: boolean
  title?: string
}

export function TableIconActionButton({
  icon,
  'aria-label': ariaLabel,
  onClick,
  disabled = false,
  title,
}: TableIconActionButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn(
        'bg-surface-subtle text-muted-foreground size-8 shrink-0 rounded-[8px] border-none p-0',
        'focus-visible:ring-ring/50 shadow-none focus-visible:ring-2',
      )}
    >
      {icon}
    </Button>
  )
}
