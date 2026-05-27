import { ClearableSelect, type SelectOption } from '@/shared/ui/clearable-select'

import { useVenueFilterPlaceholder } from '../lib/use-venue-filter-placeholder'
import type { VenueFilterKey } from '../lib/filter-labels'

type VenueFilterSelectOptions = readonly string[] | readonly SelectOption[]

interface VenueFilterSelectProps {
  filter: VenueFilterKey
  value: string | null
  onChange: (value: string | null) => void
  options: VenueFilterSelectOptions
  clearLabel?: string
  triggerClassName?: string
  disabled?: boolean
}

export function VenueFilterSelect({
  filter,
  ...props
}: VenueFilterSelectProps) {
  const placeholder = useVenueFilterPlaceholder(filter)
  return <ClearableSelect {...props} placeholder={placeholder} />
}
