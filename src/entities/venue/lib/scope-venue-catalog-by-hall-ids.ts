import type { VenueHall, VenueLoft } from '../model/types'

import { deriveSelectedLoftIds } from './loft-hall-selection'

/** Сужает каталог залов/лофтов до указанных id залов. undefined — без ограничения. */
export function scopeVenueCatalogByHallIds(
  halls: readonly VenueHall[],
  lofts: readonly VenueLoft[],
  restrictToHallIds: readonly number[] | undefined,
): { halls: VenueHall[]; lofts: VenueLoft[] } {
  if (restrictToHallIds === undefined) {
    return { halls: [...halls], lofts: [...lofts] }
  }

  const ids = new Set(restrictToHallIds)
  const scopedHalls = halls.filter((h) => ids.has(h.id))
  const loftIds = new Set(deriveSelectedLoftIds(halls, restrictToHallIds))
  const scopedLofts = lofts.filter((l) => loftIds.has(l.id))

  return { halls: scopedHalls, lofts: scopedLofts }
}
