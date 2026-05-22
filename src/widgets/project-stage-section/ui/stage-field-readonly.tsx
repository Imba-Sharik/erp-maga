import { ChevronDown } from 'lucide-react'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'

import { cn } from '@/shared/lib/utils'

import type { StageFieldSource } from '../lib/fields-map'
import { StageField } from './stage-field'

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

  const boxColors = isSystem
    ? 'border-dashed border-[#C7C7C7] bg-[#F4F2EC] text-[#6B6B6B]'
    : 'border-[#B1B1B1] bg-[#FAFAFA] text-[#454545]'

  if (multiline) {
    return (
      <StageField label={label} className={cn('h-full', className)}>
        {/* contain-size: высота бокса не зависит от длины текста — грид-строка
            не распирается. Скролл — через OverlayScrollbars, как везде в проекте. */}
        <div
          className={cn(
            'contain-size flex min-h-[90px] w-full flex-1 rounded-[10px] border text-sm',
            boxColors,
          )}
          title={isSystem ? 'Заполнено системой' : undefined}
        >
          <OverlayScrollbarsComponent
            options={{
              overflow: { x: 'hidden', y: 'scroll' },
              scrollbars: {
                visibility: 'auto',
                autoHide: 'leave',
                autoHideDelay: 600,
              },
            }}
            className="stage-comment-scroll-area w-full"
          >
            <div className="px-3 py-2">
              <span className={cn('wrap-break-word', !value && 'text-muted-foreground')}>
                {display}
              </span>
            </div>
          </OverlayScrollbarsComponent>
        </div>
      </StageField>
    )
  }

  return (
    <StageField label={label} className={className}>
      <div
        className={cn(
          'flex h-9 w-full items-center rounded-[10px] border px-3 py-2 text-sm',
          boxColors,
        )}
        title={isSystem ? 'Заполнено системой' : undefined}
      >
        <span className={cn('min-w-0 flex-1 truncate', !value && 'text-muted-foreground')}>
          {display}
        </span>
        {isSelect ? <ChevronDown className="text-muted-foreground ml-2 size-3.5 shrink-0" /> : null}
      </div>
    </StageField>
  )
}
