import type { VenueHall, VenueLoft, VenueSelectOption } from '../model/types'

function sortByNameRu<T extends { name: string }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, 'ru'))
}

export function hallsToSelectOptions(halls: readonly VenueHall[]): VenueSelectOption[] {
  return sortByNameRu(halls).map((hall) => ({
    value: hall.name,
    label: hall.name,
  }))
}

export function loftsToSelectOptions(lofts: readonly VenueLoft[]): VenueSelectOption[] {
  return sortByNameRu(lofts).map((loft) => ({
    value: loft.name,
    label: loft.name,
  }))
}

/** Залы, сгруппированные по id лофта (для зависимых селектов). */
export function hallsByLoftId(halls: readonly VenueHall[]): Map<number, VenueHall[]> {
  const map = new Map<number, VenueHall[]>()
  for (const hall of halls) {
    const loftId = hall.loft?.id
    if (loftId == null) continue
    const list = map.get(loftId) ?? []
    list.push(hall)
    map.set(loftId, list)
  }
  for (const [loftId, list] of map) {
    map.set(loftId, sortByNameRu(list))
  }
  return map
}
