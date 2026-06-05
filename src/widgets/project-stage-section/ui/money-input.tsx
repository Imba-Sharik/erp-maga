import { useEffect, useState } from 'react'

import { formatMoney } from '@/entities/project-articles'
import { Input } from '@/shared/ui/input'

interface MoneyInputProps {
  value: number | null
  onCommit: (next: number | null) => void
  placeholder?: string
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
  className = 'h-9 rounded-[10px] border-[#B1B1B1] bg-white text-sm',
}: MoneyInputProps) {
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
      className={className}
    />
  )
}
