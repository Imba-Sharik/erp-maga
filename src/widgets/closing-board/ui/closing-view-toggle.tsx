import { Columns3, Table } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

export type ClosingViewMode = 'kanban' | 'table'

const OPTIONS: { value: ClosingViewMode; label: string; Icon: typeof Columns3 }[] = [
  { value: 'kanban', label: 'Канбан', Icon: Columns3 },
  { value: 'table', label: 'Таблица', Icon: Table },
]

interface ClosingViewToggleProps {
  value: ClosingViewMode
  onChange: (value: ClosingViewMode) => void
  className?: string
}

/** Сегментный переключатель «канбан ⇄ таблица» для раздела «Закрытие». */
export function ClosingViewToggle({ value, onChange, className }: ClosingViewToggleProps) {
  return (
    <div
      role="group"
      aria-label="Вид отображения"
      className={cn(
        'border-border-strong bg-card flex h-10 shrink-0 items-center gap-1 rounded-[10px] border p-1',
        className,
      )}
    >
      {OPTIONS.map(({ value: option, label, Icon }) => {
        const active = value === option
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            aria-label={label}
            title={label}
            onClick={() => onChange(option)}
            className={cn(
              'flex h-full w-9 cursor-pointer items-center justify-center rounded-[7px] transition-colors',
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground-soft hover:bg-surface-muted',
            )}
          >
            <Icon className="size-4" />
          </button>
        )
      })}
    </div>
  )
}
