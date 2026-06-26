import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'

interface ProjectAsideCardProps {
  title: ReactNode
  badge?: ReactNode
  subline?: ReactNode
  children: ReactNode
  className?: string
}

export function ProjectAsideCard({
  title,
  badge,
  subline,
  children,
  className,
}: ProjectAsideCardProps) {
  return (
    <div
      className={cn(
        'border-border-strong bg-card @container flex flex-col rounded-[15px] border p-2 @xl:p-3.75',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-foreground-soft text-sm font-medium">{title}</p>
        {badge}
      </div>
      {subline ? (
        <p className="text-muted-foreground pt-1.5 pb-2.5 text-xs">{subline}</p>
      ) : (
        <div className="h-1" />
      )}
      <div className="divide-surface-divider divide-y [&>*:last-child]:pb-0">{children}</div>
    </div>
  )
}
