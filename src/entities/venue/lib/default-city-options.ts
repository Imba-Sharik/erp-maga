import type { VenueSelectOption } from '../model/types'

/**
 * Города Plum для фильтра директора/админа: `value` — Plum ID (как в параметре
 * `city` у `/projects/`), `label` — название.
 */
export const DEFAULT_CITY_OPTIONS: readonly VenueSelectOption[] = [
  { value: '1', label: 'Москва' },
  { value: '2', label: 'Санкт-Петербург' },
  { value: '3', label: 'МО' },
]

/** Подписи городов по Plum ID — для оптимистичной карточки создания проекта. */
export function plumCityLabelsByIds(ids: readonly number[]): string[] {
  return ids
    .map((id) => DEFAULT_CITY_OPTIONS.find((option) => option.value === String(id))?.label)
    .filter((label): label is string => Boolean(label))
}
