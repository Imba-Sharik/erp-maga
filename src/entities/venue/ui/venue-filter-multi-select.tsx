import type { SelectOption } from '@/shared/ui/clearable-select'
import { MultiSelect } from '@/shared/ui/multi-select'

import { useVenueFilterPlaceholder } from '../lib/use-venue-filter-placeholder'
import type { VenueFilterKey } from '../lib/filter-labels'

type VenueFilterMultiSelectOptions = readonly string[] | readonly SelectOption[]

interface VenueFilterMultiSelectProps {
  filter: VenueFilterKey
  values: string[]
  onChange: (values: string[]) => void
  options: VenueFilterMultiSelectOptions
  triggerClassName?: string
  disabled?: boolean
}

export function VenueFilterMultiSelect({
  filter,
  ...props
}: VenueFilterMultiSelectProps) {
  const placeholder = useVenueFilterPlaceholder(filter)
  return <MultiSelect {...props} placeholder={placeholder} clearable />
}
