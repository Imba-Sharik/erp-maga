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
        'cursor-pointer size-8 shrink-0 rounded-[8px] border-none bg-[#f8f8f8] p-0 text-[#ACACAC]',
        'shadow-none focus-visible:ring-2 focus-visible:ring-ring/50',
      )}
    >
      {icon}
    </Button>
  )
}
