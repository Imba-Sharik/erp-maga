import { useIsMobile } from '@/shared/hooks/use-mobile'

import { venueFilterPlaceholder, type VenueFilterKey } from './filter-labels'

export function useVenueFilterPlaceholder(key: VenueFilterKey): string {
  const compact = useIsMobile()
  return venueFilterPlaceholder(key, compact)
}
