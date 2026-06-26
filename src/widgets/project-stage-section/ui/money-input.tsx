import { useEffect, useState } from 'react'

import { formatMoney } from '@/entities/project-article'
import { cn } from '@/shared/lib/utils'
import { Input } from '@/shared/ui/input'

interface MoneyInputProps {
  value: number | null
  onCommit: (next: number | null) => void
  placeholder?: string
  invalid?: boolean
  className?: string
}

function digitsOnly(input: string): string {
  return input.replace(/[^\d]/g, '')
}

function valueToDraft(value: number | null): string {
  if (value === null) return ''
  return String(value)
}

/** Money-input для manager-полей: цифры фильтруются, форматирование пробелов + ₽ — в blur. */
export function MoneyInput({
  value,
  onCommit,
  placeholder = 'Введите сумму',
  invalid = false,
  className,
}: MoneyInputProps) {
  const inputClassName = cn('h-9 rounded-[10px] border-border-strong bg-white text-sm', className)
  const [focused, setFocused] = useState(false)
  const [draft, setDraft] = useState(() => valueToDraft(value))

  useEffect(() => {
    if (!focused) setDraft(valueToDraft(value))
  }, [value, focused])

  const display = focused ? draft : value === null ? '' : formatMoney(value)

  return (
    <Input
      inputMode="numeric"
      value={display}
      placeholder={placeholder}
      onFocus={() => {
        setFocused(true)
        setDraft(valueToDraft(value))
      }}
      onBlur={() => {
        setFocused(false)
        const digits = digitsOnly(draft)
        onCommit(digits ? Number(digits) : null)
      }}
      onChange={(e) => setDraft(digitsOnly(e.target.value))}
      aria-invalid={invalid}
      className={inputClassName}
    />
  )
}
