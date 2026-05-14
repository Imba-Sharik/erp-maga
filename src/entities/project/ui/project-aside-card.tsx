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
        'flex flex-col rounded-[15px] border border-[#B1B1B1] bg-white p-[15px]',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-[#454545]">{title}</p>
        {badge}
      </div>
      {subline ? (
        <p className="text-muted-foreground pt-1.5 pb-2.5 text-xs">{subline}</p>
      ) : (
        <div className="h-1" />
      )}
      <div className="divide-y divide-[#F0F0F0]">{children}</div>
    </div>
  )
}
