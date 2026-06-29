import { MultiSelect } from '@/shared/ui/multi-select'

import { PLUM_EVENT_STATUS_OPTIONS } from '../lib/plum-event-status-catalog'

interface PlumEventStatusFilterSelectProps {
  values: string[]
  onChange: (values: string[]) => void
  triggerClassName?: string
  disabled?: boolean
}

export function PlumEventStatusFilterSelect({
  values,
  onChange,
  triggerClassName,
  disabled,
}: PlumEventStatusFilterSelectProps) {
  return (
    <MultiSelect
      placeholder="Статус в PLUM"
      values={values}
      options={PLUM_EVENT_STATUS_OPTIONS}
      onChange={onChange}
      triggerClassName={triggerClassName}
      disabled={disabled}
      clearable
    />
  )
}
