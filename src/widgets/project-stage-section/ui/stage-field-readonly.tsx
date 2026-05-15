import { ChevronDown } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

import type { StageFieldSource } from '../lib/fields-map'
import { StageFieldShell } from './stage-field-shell'

interface StageFieldReadonlyProps {
  label: string
  value: string | null | undefined
  multiline?: boolean
  className?: string
  source?: StageFieldSource
  isSelect?: boolean
}

export function StageFieldReadonly({
  label,
  value,
  multiline,
  className,
  source = 'manager',
  isSelect = false,
}: StageFieldReadonlyProps) {
  const display = value && value.length > 0 ? value : '—'
  const isSystem = source === 'system'

  return (
    <StageFieldShell label={label} className={className}>
      <div
        className={cn(
          'flex w-full rounded-[10px] border px-3 py-2 text-[13px]',
          multiline ? 'min-h-[90px] items-start' : 'h-9 items-center',
          isSystem
            ? 'border-dashed border-[#C7C7C7] bg-[#F4F2EC] text-[#6B6B6B] italic'
            : 'border-[#B1B1B1] bg-[#FAFAFA] text-[#454545]',
        )}
        title={isSystem ? 'Заполнено системой' : undefined}
      >
        <span className={cn('min-w-0 flex-1', !value && 'text-muted-foreground')}>{display}</span>
        {isSelect ? (
          <ChevronDown className="text-muted-foreground ml-2 size-3.5 shrink-0" />
        ) : null}
      </div>
    </StageFieldShell>
  )
}
