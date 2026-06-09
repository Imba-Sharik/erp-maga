import { PlumEventStatusFilterSelect } from '@/entities/project'
import { useLoftHallFilter } from '@/entities/venue'
import { ClearableSelect, type SelectOption } from '@/shared/ui/clearable-select'

import type { ColumnFilterKey, ColumnFilters } from '../lib/filter-projects-table'

export const HEADER_FILTER_TRIGGER =
  'h-8! w-full min-w-0 gap-1 rounded-sm border-0 bg-[#F6F6F6] px-2 text-sm text-[#454545] shadow-none data-placeholder:text-[#454545]'

interface TableHeaderFiltersProps {
  columnFilters: ColumnFilters
  managerOptions: readonly SelectOption[]
  onColumnFilterChange: (key: ColumnFilterKey, value: string | null) => void
  managerOptionsLoading?: boolean
  managerOptionsError?: boolean
}

export function TableHeaderLoftFilter({
  columnFilters,
  onColumnFilterChange,
}: Pick<TableHeaderFiltersProps, 'columnFilters' | 'onColumnFilterChange'>) {
  const { loftOptions, selectDisabled, shouldResetHall } = useLoftHallFilter(columnFilters.loft)

  return (
    <ClearableSelect
      placeholder="LOFT"
      value={columnFilters.loft}
      options={loftOptions}
      onChange={(v) => {
        onColumnFilterChange('loft', v)
        // Выбранный зал не из нового лофта — сбрасываем.
        if (shouldResetHall(v, columnFilters.hall)) onColumnFilterChange('hall', null)
      }}
      triggerClassName={HEADER_FILTER_TRIGGER}
      disabled={selectDisabled}
    />
  )
}

export function TableHeaderHallFilter({
  columnFilters,
  onColumnFilterChange,
}: Pick<TableHeaderFiltersProps, 'columnFilters' | 'onColumnFilterChange'>) {
  // Выбран лофт — показываем только его залы.
  const { hallOptions, selectDisabled } = useLoftHallFilter(columnFilters.loft)

  return (
    <ClearableSelect
      placeholder="Зал"
      value={columnFilters.hall}
      options={hallOptions}
      onChange={(v) => onColumnFilterChange('hall', v)}
      triggerClassName={HEADER_FILTER_TRIGGER}
      disabled={selectDisabled}
    />
  )
}

export function TableHeaderPlumStatusFilter({
  columnFilters,
  onColumnFilterChange,
}: Pick<TableHeaderFiltersProps, 'columnFilters' | 'onColumnFilterChange'>) {
  return (
    <PlumEventStatusFilterSelect
      value={columnFilters.plumEventStatus}
      onChange={(v) => onColumnFilterChange('plumEventStatus', v)}
      triggerClassName={HEADER_FILTER_TRIGGER}
    />
  )
}

export function TableHeaderManagerFilter({
  columnFilters,
  managerOptions,
  onColumnFilterChange,
  managerOptionsLoading = false,
  managerOptionsError = false,
}: TableHeaderFiltersProps) {
  return (
    <ClearableSelect
      placeholder="Отв. менеджер"
      value={columnFilters.manager}
      options={managerOptions}
      onChange={(v) => onColumnFilterChange('manager', v)}
      triggerClassName={HEADER_FILTER_TRIGGER}
      disabled={managerOptionsLoading || managerOptionsError}
    />
  )
}
