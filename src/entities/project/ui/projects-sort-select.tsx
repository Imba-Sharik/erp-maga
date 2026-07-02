import { ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

import {
  PROJECTS_SORT_OPTIONS,
  buildProjectsSortValue,
  parseProjectsSort,
} from '../lib/projects-sort-catalog'

interface ProjectsSortSelectProps {
  /** Полное значение `ordering` (например `-created_at`): поле + направление. */
  value: string
  onChange: (value: string) => void
  /** Класс контейнера — задаёт ширину слота сортировки в тулбаре. */
  className?: string
  disabled?: boolean
}

export function ProjectsSortSelect({
  value,
  onChange,
  className,
  disabled,
}: ProjectsSortSelectProps) {
  const { field, direction } = parseProjectsSort(value)
  const isAsc = direction === 'asc'
  const DirectionIcon = isAsc ? ArrowUpNarrowWide : ArrowDownWideNarrow

  return (
    <div className={cn('flex min-w-0 items-center gap-1.5', className)}>
      {/* Стрелка слева — переключает порядок сортировки, не меняя выбранное поле (ERP-195). */}
      <Button
        type="button"
        variant="outline"
        size="icon-lg"
        disabled={disabled}
        onClick={() => onChange(buildProjectsSortValue(field, isAsc ? 'desc' : 'asc'))}
        aria-label={`Порядок сортировки: ${isAsc ? 'по возрастанию' : 'по убыванию'}`}
        title={isAsc ? 'По возрастанию' : 'По убыванию'}
        className="border-border-medium text-foreground-soft hover:bg-surface-muted bg-card shrink-0 rounded-[15px]"
      >
        <DirectionIcon className="size-4" />
      </Button>
      <Select
        value={field}
        onValueChange={(nextField) => onChange(buildProjectsSortValue(nextField, direction))}
        disabled={disabled}
      >
        <SelectTrigger className="border-border-medium data-placeholder:text-disabled-foreground bg-card h-10! min-w-0 flex-1 rounded-[15px] text-xs @4xl:text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PROJECTS_SORT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
