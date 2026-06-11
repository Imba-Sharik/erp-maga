import type { SelectOption } from '@/shared/ui/clearable-select'

/** Коды статусов мероприятия в Plum (как на бэке в LOFTHALL_EVENT_STATUS_LABELS). */
export const PLUM_EVENT_STATUS_LABELS: Record<number, string> = {
  1: 'Неразобранное',
  2: 'Пре-сейл',
  3: 'Недозвон',
  4: 'Заявка',
  5: 'Встреча',
  6: 'Подтверждено',
  7: 'Предоплата',
  8: 'Меню отправлено',
  9: 'ТЗ отправлено',
  10: 'Завершение',
  11: 'Успех',
  12: 'Провал',
  13: 'Штраф',
  14: 'Перенос',
}

export const PLUM_EVENT_STATUS_OPTIONS: SelectOption[] = Object.entries(
  PLUM_EVENT_STATUS_LABELS,
).map(([code, label]) => ({
  value: code,
  label,
}))

/** Выбранные коды статуса Plum в фильтрах (пустой массив — фильтр выключен). */
export type PlumEventStatusFilterValues = string[]

export function parsePlumEventStatusCode(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined || raw === '') return null
  const n = typeof raw === 'number' ? raw : Number.parseInt(String(raw).trim(), 10)
  return Number.isFinite(n) ? n : null
}

export function plumEventStatusLabel(code: number | null): string | null {
  if (code === null) return null
  return PLUM_EVENT_STATUS_LABELS[code] ?? null
}

function parsePlumEventStatusFilterCodes(values: readonly string[]): number[] {
  const codes: number[] = []
  const seen = new Set<number>()
  for (const value of values) {
    const code = parsePlumEventStatusCode(value)
    if (code !== null && !seen.has(code)) {
      seen.add(code)
      codes.push(code)
    }
  }
  return codes
}

export type PlumEventStatusFilterQueryParams =
  | { plum_event_status: number }
  | { plum_event_status__in: string }

/** Значения фильтра → query-параметры `plum_event_status` или `plum_event_status__in`. */
export function plumEventStatusFilterQueryParams(
  values: readonly string[],
): PlumEventStatusFilterQueryParams | Record<string, never> {
  const codes = parsePlumEventStatusFilterCodes(values)
  if (codes.length === 0) return {}
  if (codes.length === 1) return { plum_event_status: codes[0]! }
  return { plum_event_status__in: codes.join(',') }
}
