import { useMemo } from 'react'

import {
  resolveRestrictToHallIds,
  type ResolveRestrictToHallIdsOptions,
} from '../lib/resolve-restrict-to-hall-ids'
import type { Manager } from './types'

export interface UseManagerVenueRestrictionOptions extends ResolveRestrictToHallIdsOptions {
  managerId: string | null | undefined
  managers: readonly Manager[]
  managersLoading?: boolean
}

/** Связка «выбранный менеджер → restrictToHallIds + disabled селектов площадок». */
export function useManagerVenueRestriction({
  managerId,
  managers,
  enabled = true,
  managersLoading = false,
}: UseManagerVenueRestrictionOptions) {
  const restrictToHallIds = useMemo(
    () => resolveRestrictToHallIds(managerId, managers, { enabled }),
    [managerId, managers, enabled],
  )

  const venueSelectDisabled = enabled && Boolean(managerId) && managersLoading

  return { restrictToHallIds, venueSelectDisabled }
}
