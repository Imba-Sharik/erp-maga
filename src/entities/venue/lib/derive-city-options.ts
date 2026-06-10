import type { VenueLoft } from '../model/types'

/** Уникальные подписи городов из закреплённых LOFTов менеджера. */
export function deriveCityOptionsFromLofts(lofts: readonly VenueLoft[]): string[] {
  const labels = new Set<string>()
  for (const loft of lofts) {
    const label = loft.city_label?.trim()
    if (label) labels.add(label)
  }
  return [...labels].sort((a, b) => a.localeCompare(b, 'ru'))
}
