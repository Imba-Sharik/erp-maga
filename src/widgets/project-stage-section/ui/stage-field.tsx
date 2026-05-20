import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'

import { StageFieldLabel } from './stage-field-label'

interface StageFieldProps {
  label: string
  required?: boolean
  className?: string
  children: ReactNode
}

export function StageField({ label, required, className, children }: StageFieldProps) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <StageFieldLabel label={label} required={required} />
      {children}
    </div>
  )
}
