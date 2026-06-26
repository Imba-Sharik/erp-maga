import type { ReactNode } from 'react'
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
  hideLabel?: boolean
}

export function StageFieldReadonly({
  label,
  value,
  multiline,
  className,
  source = 'manager',
  isSelect = false,
  hideLabel = false,
}: StageFieldReadonlyProps) {
  const display = value && value.length > 0 ? value : '—'
  const isSystem = source === 'system'

  const boxColors = isSystem
    ? 'border-dashed border-border-medium bg-surface-muted text-foreground-soft'
    : 'border-border-strong bg-surface-subtle text-foreground-soft'

  const wrap = (content: ReactNode, fieldClassName?: string) =>
    hideLabel ? (
      <div className={cn('min-w-0', fieldClassName ?? className)}>{content}</div>
    ) : (
      <StageField label={label} className={fieldClassName ?? className}>
        {content}
      </StageField>
    )

  if (multiline) {
    return wrap(
      <div
        className={cn(
          'flex min-h-[90px] w-full flex-1 rounded-[10px] border text-sm contain-size',
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
      </div>,
      cn('h-full', className),
    )
  }

  return wrap(
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
    </div>,
  )
}
