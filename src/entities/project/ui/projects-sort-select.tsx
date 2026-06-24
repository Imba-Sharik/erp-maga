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
        className="shrink-0 rounded-[10px] border-[#B1B1B1] bg-white text-[#454545] hover:bg-[#F5F5F5]"
      >
        <DirectionIcon className="size-4" />
      </Button>
      <Select
        value={field}
        onValueChange={(nextField) => onChange(buildProjectsSortValue(nextField, direction))}
        disabled={disabled}
      >
        <SelectTrigger className="h-10! min-w-0 flex-1 rounded-[10px] border-[#B1B1B1] bg-white text-xs data-placeholder:text-[#BCBCBC] @4xl:text-sm">
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
