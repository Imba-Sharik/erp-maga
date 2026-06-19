import { PROJECTS_LIST_DEFAULT_ORDERING } from '@/shared/constants/projects-list-ordering'
import type { SelectOption } from '@/shared/ui/clearable-select'

/** Сортировка проектов по дате мероприятия (сначала поздние). */
export const PROJECTS_SORT_BY_EVENT_DATE = '-event_date'
/** Сортировка по дате создания — текущее поведение по умолчанию. */
export const PROJECTS_SORT_BY_CREATED = PROJECTS_LIST_DEFAULT_ORDERING

/** Значение сортировки по умолчанию (как на бэке): сначала недавно созданные. */
export const PROJECTS_SORT_DEFAULT = PROJECTS_SORT_BY_CREATED

export const PROJECTS_SORT_OPTIONS: SelectOption[] = [
  { value: PROJECTS_SORT_BY_EVENT_DATE, label: 'По дате мероприятия' },
  { value: PROJECTS_SORT_BY_CREATED, label: 'По дате создания' },
]
