import { cn } from '@/shared/lib/utils'

import { StageFieldShell } from './stage-field-shell'

interface StageFieldReadonlyProps {
  label: string
  value: string | null | undefined
  multiline?: boolean
  className?: string
}

export function StageFieldReadonly({ label, value, multiline, className }: StageFieldReadonlyProps) {
  const display = value && value.length > 0 ? value : '—'

  return (
    <StageFieldShell label={label} className={className}>
      <div
        className={cn(
          'flex w-full rounded-[10px] border border-[#B1B1B1] bg-[#FAFAFA] px-3 py-2 text-[13px] text-[#454545]',
          multiline ? 'min-h-[90px] items-start' : 'h-9 items-center',
        )}
      >
        <span className={cn('min-w-0 flex-1', !value && 'text-muted-foreground')}>{display}</span>
      </div>
    </StageFieldShell>
  )
}
