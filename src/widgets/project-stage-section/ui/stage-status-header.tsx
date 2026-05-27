import { ChevronDown } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { CollapsibleTrigger } from '@/shared/ui/collapsible'

const rowClass = 'flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden text-sm'

interface StageStatusHeaderProps {
  statusLabel: string
  title: string
  titleClassName?: string
  statusClassName?: string
  collapsible?: boolean
}

export function StageStatusHeader({
  statusLabel,
  title,
  titleClassName,
  statusClassName = 'font-medium text-[#454545]',
  collapsible = false,
}: StageStatusHeaderProps) {
  const status = (
    <span className={cn('shrink-0 whitespace-nowrap', statusClassName)}>{statusLabel}</span>
  )
  const titleEl = (
    <span className={cn('min-w-0 truncate font-semibold', titleClassName)}>{title}</span>
  )

  if (collapsible) {
    return (
      <CollapsibleTrigger className={cn('group', rowClass)}>
        {status}
        {titleEl}
        <ChevronDown className="text-muted-foreground size-3.5 shrink-0 transition-transform group-data-[state=closed]:-rotate-90" />
      </CollapsibleTrigger>
    )
  }

  return (
    <div className={rowClass}>
      {status}
      {titleEl}
    </div>
  )
}
