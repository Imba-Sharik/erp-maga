import * as React from 'react'

import { formatRuPhone } from '@/shared/lib/phone/format-ru-phone'
import { Input } from '@/shared/ui/input'

const PHONE_MASK_PLACEHOLDER = '+7 (999) 999-99-99'

type PhoneInputProps = Omit<
  React.ComponentProps<typeof Input>,
  'value' | 'onChange' | 'type' | 'inputMode'
> & {
  value: string
  onChange: (value: string) => void
}

/**
 * Поле ввода телефона с фиксированной маской `+7 (XXX) XXX-XX-XX`.
 * Хранит и отдаёт уже отформатированную строку. Каретка всегда уходит в конец,
 * поэтому правки в середине номера не поддерживаются — осознанный компромисс
 * простой реализации без зависимостей.
 */
export function PhoneInput({ value, onChange, placeholder, ref, ...rest }: PhoneInputProps) {
  const innerRef = React.useRef<HTMLInputElement | null>(null)

  const setRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      innerRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    },
    [ref],
  )

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = formatRuPhone(event.target.value)
    onChange(next)
    // Маска перезаписывает строку целиком: возвращаем каретку в конец и
    // синхронизируем DOM на случай, когда значение не изменилось (например,
    // стёрли только символ маски) и React пропустит ререндер.
    requestAnimationFrame(() => {
      const el = innerRef.current
      if (!el) return
      el.value = next
      el.setSelectionRange(next.length, next.length)
    })
  }

  return (
    <Input
      {...rest}
      ref={setRef}
      type="tel"
      inputMode="tel"
      value={formatRuPhone(value)}
      onChange={handleChange}
      placeholder={placeholder ?? PHONE_MASK_PLACEHOLDER}
    />
  )
}
