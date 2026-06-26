import type { ComponentType, SVGProps } from 'react'

import { cn } from '@/shared/lib/utils'

export type StageReadonlySource = 'manager' | 'system'

interface StageReadonlyBoxProps {
  value: string
  source: StageReadonlySource
  className?: string
  align?: 'left' | 'center'
  icon?: ComponentType<SVGProps<SVGSVGElement>>
}

/** Readonly-бокс: дашед-бежевый для system, плотный — для manager. */
export function StageReadonlyBox({
  value,
  source,
  className,
  align = 'left',
  icon: IconCmp,
}: StageReadonlyBoxProps) {
  const isSystem = source === 'system'
  return (
    <div
      title={isSystem ? 'Заполнено системой' : undefined}
      className={cn(
        'flex h-9 items-center rounded-[10px] border px-3 text-sm',
        IconCmp && 'gap-2',
        align === 'center' ? 'justify-center' : 'justify-start',
        isSystem
          ? 'border-border-medium bg-surface-muted text-foreground-soft border-dashed'
          : 'border-border-strong bg-surface-subtle text-foreground-soft',
        className,
      )}
    >
      {IconCmp ? <IconCmp className="text-foreground-soft size-4 shrink-0" /> : null}
      {IconCmp ? <span className="min-w-0 flex-1 truncate">{value}</span> : value}
    </div>
  )
}
