import { ClearableSelect } from '@/shared/ui/clearable-select'

import { PLUM_EVENT_STATUS_OPTIONS } from '../lib/plum-event-status-catalog'

interface PlumEventStatusFilterSelectProps {
  value: string | null
  onChange: (value: string | null) => void
  triggerClassName?: string
  disabled?: boolean
}

export function PlumEventStatusFilterSelect({
  value,
  onChange,
  triggerClassName,
  disabled,
}: PlumEventStatusFilterSelectProps) {
  return (
    <ClearableSelect
      placeholder="Статус в PLUM"
      value={value}
      options={PLUM_EVENT_STATUS_OPTIONS}
      onChange={onChange}
      triggerClassName={triggerClassName}
      disabled={disabled}
    />
  )
}
