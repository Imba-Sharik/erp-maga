import type { ManagersDirectoryFilter } from '@/entities/manager'
import type { VenueHall } from '@/entities/venue'

type PrimaryHallVenueIds = Extract<ManagersDirectoryFilter, { hallId: number }>

/** Primary зал проекта — первый id из `hall_ids` (контракт бэкенда). */
export function resolvePrimaryHallVenueIds(
  hallIds: readonly string[],
  halls: readonly VenueHall[],
): PrimaryHallVenueIds | undefined {
  const primaryHallId = Number(hallIds[0])
  if (!Number.isInteger(primaryHallId) || primaryHallId <= 0) return undefined

  const hall = halls.find((item) => item.id === primaryHallId)
  const loftId = hall?.loft?.id

  return loftId != null && Number.isFinite(loftId)
    ? { hallId: primaryHallId, loftId }
    : { hallId: primaryHallId }
}
