import type { VenueLoft, VenueSelectOption } from '../model/types'

/**
 * Опции городов из закреплённых за менеджером LOFTов: `value` — Plum ID города
 * (`loft.city`), `label` — `loft.city_label`. Дедупликация по id.
 */
export function deriveCityOptionsFromLofts(lofts: readonly VenueLoft[]): VenueSelectOption[] {
  const byId = new Map<number, string>()
  for (const loft of lofts) {
    if (loft.city == null) continue
    const label = loft.city_label?.trim()
    if (!label) continue
    if (!byId.has(loft.city)) byId.set(loft.city, label)
  }
  return [...byId.entries()]
    .sort((a, b) => a[1].localeCompare(b[1], 'ru'))
    .map(([id, label]) => ({ value: String(id), label }))
}
