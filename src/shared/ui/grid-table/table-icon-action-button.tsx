import type { ReactNode } from 'react'

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
      size="sm"
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      onClick={onClick}
      className="h-8 w-8 rounded-[8px] border-none bg-[#f8f8f8] px-2.5 text-[#ACACAC]"
    >
      {icon}
    </Button>
  )
}
