import type { VenueHall, VenueLoft } from '../model/types'

export type VenueFilterIds = {
  loft_id?: number
  hall_id?: number
}

/**
 * Имена loft/hall из UI-селектов → id для query-параметров API (`hall_id`, `loft_id`).
 * Если имя не найдено в каталоге, соответствующий параметр не включается.
 */
export function resolveVenueFilterIds(
  loftName: string | null,
  hallName: string | null,
  halls: readonly VenueHall[],
  lofts: readonly VenueLoft[],
): VenueFilterIds {
  const result: VenueFilterIds = {}

  if (loftName) {
    const loftId = lofts.find((l) => l.name === loftName)?.id
    if (loftId != null) result.loft_id = loftId
  }

  if (hallName) {
    const hallId = halls.find((h) => h.name === hallName)?.id
    if (hallId != null) result.hall_id = hallId
  }

  return result
}
