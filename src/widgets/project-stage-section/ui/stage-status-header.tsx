import { ChevronDown } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { CollapsibleTrigger } from '@/shared/ui/collapsible'

const textBlockClass =
  'flex min-w-0 max-w-full flex-col items-start gap-1.5 overflow-hidden sm:flex-row sm:items-center'

const headerRowClass = 'flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden text-sm'

const titleRowClass = 'flex min-w-0 w-full items-center gap-1.5 overflow-hidden sm:w-auto sm:flex-1'

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
  statusClassName = 'font-medium text-foreground-soft',
  collapsible = false,
}: StageStatusHeaderProps) {
  const status = (
    <span className={cn('shrink-0 whitespace-nowrap', statusClassName)}>{statusLabel}</span>
  )
  const titleEl = (
    <span
      className={cn('w-full min-w-0 truncate font-semibold sm:w-auto sm:flex-1', titleClassName)}
    >
      {title}
    </span>
  )

  const titleWithChevron = (
    <div className={titleRowClass}>
      <span className={cn('min-w-0 flex-1 truncate font-semibold', titleClassName)}>{title}</span>
      <ChevronDown className="text-muted-foreground size-3.5 shrink-0 transition-transform group-data-[state=closed]:-rotate-90" />
    </div>
  )

  const textBlock = (
    <div className={textBlockClass}>
      {status}
      {collapsible ? titleWithChevron : titleEl}
    </div>
  )

  if (collapsible) {
    return (
      <CollapsibleTrigger className={cn('group', headerRowClass)}>{textBlock}</CollapsibleTrigger>
    )
  }

  return <div className={headerRowClass}>{textBlock}</div>
}
