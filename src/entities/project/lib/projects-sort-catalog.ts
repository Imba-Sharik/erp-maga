import { PROJECTS_LIST_DEFAULT_ORDERING } from '@/shared/constants'
import type { SelectOption } from '@/shared/ui/clearable-select'

/** Направление в стиле DRF `ordering`: `field` — по возрастанию, `-field` — по убыванию. */
export type ProjectsSortDirection = 'asc' | 'desc'

/** Поле сортировки по дате мероприятия. */
export const PROJECTS_SORT_FIELD_EVENT_DATE = 'event_date'
/** Поле сортировки по дате создания. */
export const PROJECTS_SORT_FIELD_CREATED = 'created_at'

/** Значение `ordering` по умолчанию (как на бэке): сначала недавно созданные (`-created_at`). */
export const PROJECTS_SORT_DEFAULT = PROJECTS_LIST_DEFAULT_ORDERING

/** Опции селекта — только поле; направление задаётся отдельной стрелкой (ERP-195). */
export const PROJECTS_SORT_OPTIONS: SelectOption[] = [
  { value: PROJECTS_SORT_FIELD_EVENT_DATE, label: 'По дате мероприятия' },
  { value: PROJECTS_SORT_FIELD_CREATED, label: 'По дате создания' },
]

export interface ParsedProjectsSort {
  field: string
  direction: ProjectsSortDirection
}

/** Разбирает `ordering` (`-created_at`) на поле и направление. */
export function parseProjectsSort(ordering: string): ParsedProjectsSort {
  const isDesc = ordering.startsWith('-')
  return {
    field: isDesc ? ordering.slice(1) : ordering,
    direction: isDesc ? 'desc' : 'asc',
  }
}

/** Собирает `ordering` из поля и направления (`desc` → префикс `-`). */
export function buildProjectsSortValue(field: string, direction: ProjectsSortDirection): string {
  return direction === 'desc' ? `-${field}` : field
}
