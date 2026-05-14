import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'

interface StageFieldShellProps {
  label: string
  required?: boolean
  className?: string
  children: ReactNode
}

export function StageFieldShell({ label, required, className, children }: StageFieldShellProps) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <span className="text-xs font-medium text-[#454545]">
        {label}
        {required ? '*' : ''}
      </span>
      {children}
    </div>
  )
}
