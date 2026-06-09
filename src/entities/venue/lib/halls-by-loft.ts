import type { VenueHall, VenueLoft } from '../model/types'

/**
 * Залы выбранного лофта: матчим по `loft.id` (FK), c запасным вариантом по `loft.name`.
 * Каталог `/halls/halls/` отдаёт лофт вложенным объектом (`Hall.loft`).
 */
export function hallsForLoft(
  halls: readonly VenueHall[],
  lofts: readonly VenueLoft[],
  loftName: string,
): VenueHall[] {
  const target = lofts.find((l) => l.name === loftName)
  return halls.filter(
    (h) => (target != null && h.loft?.id === target.id) || h.loft?.name === loftName,
  )
}

/** Принадлежит ли зал `hallName` лофту `loftName`. */
export function hallBelongsToLoft(
  halls: readonly VenueHall[],
  lofts: readonly VenueLoft[],
  hallName: string,
  loftName: string,
): boolean {
  return hallsForLoft(halls, lofts, loftName).some((h) => h.name === hallName)
}
