import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'

const RESET_VALUE = '__clearable_select_reset__'
const EMPTY_KEY = '__clearable_select_empty__'

interface ClearableSelectProps {
  value: string | null
  onChange: (value: string | null) => void
  options: readonly string[]
  placeholder: string
  clearLabel?: string
  triggerClassName?: string
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
}: ClearableSelectProps) {
  return (
    <Select
      key={value ?? EMPTY_KEY}
      value={value ?? undefined}
      onValueChange={(v) => onChange(v === RESET_VALUE ? null : v)}
    >
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={RESET_VALUE} className="text-muted-foreground">
          {clearLabel}
        </SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
