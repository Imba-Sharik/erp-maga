import type { ColumnFilterKey, ColumnFilters } from './filter-projects-table'

/** Смена фильтра менеджера сбрасывает зал и LOFT — они могут быть недоступны у нового менеджера. */
export function applyColumnFilterChange(
  prev: ColumnFilters,
  key: ColumnFilterKey,
  value: string | null,
): ColumnFilters {
  if (key === 'manager') {
    return { ...prev, manager: value, hall: null, loft: null }
  }

  return { ...prev, [key]: value }
}
