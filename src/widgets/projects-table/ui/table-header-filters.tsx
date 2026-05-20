import { HALL_OPTIONS, LOFT_OPTIONS } from '@/shared/constants/venue-options'
import { ClearableSelect } from '@/shared/ui/clearable-select'

import type { ColumnFilterKey, ColumnFilters } from '../lib/filter-projects-table'

export const HEADER_FILTER_TRIGGER =
  'h-8! w-full min-w-0 gap-1 rounded-sm border-0 bg-[#F6F6F6] px-2 text-sm text-[#454545] shadow-none data-placeholder:text-[#454545]'

interface TableHeaderFiltersProps {
  columnFilters: ColumnFilters
  managerOptions: string[]
  onColumnFilterChange: (key: ColumnFilterKey, value: string | null) => void
}

export function TableHeaderLoftFilter({
  columnFilters,
  onColumnFilterChange,
}: Pick<TableHeaderFiltersProps, 'columnFilters' | 'onColumnFilterChange'>) {
  return (
    <ClearableSelect
      placeholder="LOFT"
      value={columnFilters.loft}
      options={LOFT_OPTIONS}
      onChange={(v) => onColumnFilterChange('loft', v)}
      triggerClassName={HEADER_FILTER_TRIGGER}
    />
  )
}

export function TableHeaderHallFilter({
  columnFilters,
  onColumnFilterChange,
}: Pick<TableHeaderFiltersProps, 'columnFilters' | 'onColumnFilterChange'>) {
  return (
    <ClearableSelect
      placeholder="Зал"
      value={columnFilters.hall}
      options={HALL_OPTIONS}
      onChange={(v) => onColumnFilterChange('hall', v)}
      triggerClassName={HEADER_FILTER_TRIGGER}
    />
  )
}

export function TableHeaderManagerFilter({
  columnFilters,
  managerOptions,
  onColumnFilterChange,
}: TableHeaderFiltersProps) {
  return (
    <ClearableSelect
      placeholder="Отв. менеджер"
      value={columnFilters.manager}
      options={managerOptions}
      onChange={(v) => onColumnFilterChange('manager', v)}
      triggerClassName={HEADER_FILTER_TRIGGER}
    />
  )
}
