import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'

const RESET_VALUE = '__clearable_select_reset__'
const EMPTY_KEY = '__clearable_select_empty__'

export type SelectOption = {
  value: string
  label: string
}

type ClearableSelectOptions = readonly string[] | readonly SelectOption[]

function normalizeOptions(options: ClearableSelectOptions): SelectOption[] {
  if (options.length === 0) return []
  if (typeof options[0] === 'string') {
    return (options as readonly string[]).map((value) => ({ value, label: value }))
  }
  return [...(options as readonly SelectOption[])]
}

interface ClearableSelectProps {
  value: string | null
  onChange: (value: string | null) => void
  options: ClearableSelectOptions
  placeholder: string
  clearLabel?: string
  triggerClassName?: string
  disabled?: boolean
}

/**
 * Select с пустым вариантом «Не выбрано» поверх shadcn-Select.
 * - Возвращает в плейсхолдер при выборе clear-итема (Radix-baked-in workaround через key-remount).
 * - Используем зарезервированное `value` для clear-итема, чтобы Radix не падал на пустой строке.
 */
export function ClearableSelect({
  value,
  onChange,
  options,
  placeholder,
  clearLabel = 'Не выбрано',
  triggerClassName,
  disabled = false,
}: ClearableSelectProps) {
  return (
    <Select
      key={value ?? EMPTY_KEY}
      value={value ?? undefined}
      onValueChange={(v) => onChange(v === RESET_VALUE ? null : v)}
      disabled={disabled}
    >
      <SelectTrigger className={triggerClassName} disabled={disabled}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={RESET_VALUE} className="text-muted-foreground">
          {clearLabel}
        </SelectItem>
        {normalizeOptions(options).map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
