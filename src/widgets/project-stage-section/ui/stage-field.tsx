import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'

import { StageFieldLabel } from './stage-field-label'

interface StageFieldProps {
  label: string
  required?: boolean
  error?: string
  className?: string
  children: ReactNode
}

export function StageField({ label, required, error, className, children }: StageFieldProps) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <StageFieldLabel label={label} required={required} error={!!error} />
      {children}
      {error ? (
        <p className="text-destructive text-[11px]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
