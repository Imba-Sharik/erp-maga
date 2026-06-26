import { CALENDAR_EVENT_TYPE_OPTIONS } from '@/shared/constants'
import { ClearableSelect } from '@/shared/ui/clearable-select'

const OPTIONS = CALENDAR_EVENT_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))

interface EventTypeSelectProps {
  value: string
  onChange: (value: string) => void
  triggerClassName?: string
  disabled?: boolean
}

/** Селект типа события календаря (встречи/напоминания), ERP-215. Обязательное поле. */
export function EventTypeSelect({ value, onChange, triggerClassName, disabled }: EventTypeSelectProps) {
  return (
    <ClearableSelect
      placeholder="Выберите тип"
      value={value || null}
      options={OPTIONS}
      onChange={(v) => onChange(v ?? '')}
      triggerClassName={triggerClassName}
      disabled={disabled}
    />
  )
}
