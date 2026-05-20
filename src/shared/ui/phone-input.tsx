import * as React from 'react'

import { extractLocalDigits } from '@/shared/lib/phone/extract-local-digits'
import { formatLocalDigits, formatRuPhone } from '@/shared/lib/phone/format-ru-phone'
import { Input } from '@/shared/ui/input'

/** Базовый префикс: поле никогда не пустеет, чтобы код страны был виден сразу. */
const PHONE_PREFIX = '+7 '

type PhoneInputProps = Omit<
  React.ComponentProps<typeof Input>,
  'value' | 'onChange' | 'type' | 'inputMode'
> & {
  value: string
  onChange: (value: string) => void
}

/**
 * Поле ввода телефона с фиксированной маской `+7 (XXX) XXX-XX-XX`.
 * Префикс `+7` всегда виден — пользователь вводит только 10 цифр номера,
 * поэтому первый введённый символ не теряется (раньше ведущие `7`/`8`
 * трактовались как код страны и «проглатывались»).
 * Хранит и отдаёт отформатированную строку (пустую, если цифр нет).
 * Каретка всегда уходит в конец, поэтому правки в середине не поддерживаются —
 * осознанный компромисс простой реализации без зависимостей.
 */
export function PhoneInput({ value, onChange, ref, ...rest }: PhoneInputProps) {
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
    const inputType = (event.nativeEvent as InputEvent).inputType ?? ''
    let local = extractLocalDigits(event.target.value)

    // Backspace, стерший только символ маски (скобку): количество цифр не
    // изменилось — значит пользователь хотел удалить цифру, убираем последнюю.
    // Иначе каретка «застревает» на `)`, которую маска возвращает обратно.
    if (inputType.startsWith('delete') && local.length === extractLocalDigits(value).length) {
      local = local.slice(0, -1)
    }

    const next = formatLocalDigits(local)
    onChange(next)
    // Маска перезаписывает строку целиком: возвращаем каретку в конец и
    // синхронизируем DOM на случай, когда значение не изменилось (например,
    // стёрли только символ маски) и React пропустит ререндер.
    requestAnimationFrame(() => {
      const el = innerRef.current
      if (!el) return
      const shown = next || PHONE_PREFIX
      el.value = shown
      el.setSelectionRange(shown.length, shown.length)
    })
  }

  return (
    <Input
      {...rest}
      ref={setRef}
      type="tel"
      inputMode="tel"
      value={formatRuPhone(value) || PHONE_PREFIX}
      onChange={handleChange}
    />
  )
}
