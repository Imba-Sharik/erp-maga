import { extractLocalDigits } from './extract-local-digits'

/**
 * Форматирует номер под маску `+7 (XXX) XXX-XX-XX`.
 * Частичный ввод даёт частичную маску; пустая строка — пустой результат.
 */
export function formatRuPhone(raw: string): string {
  const d = extractLocalDigits(raw)
  if (!d) return ''

  let out = `+7 (${d.slice(0, 3)}`
  if (d.length >= 3) out += ')'
  if (d.length > 3) out += ` ${d.slice(3, 6)}`
  if (d.length > 6) out += `-${d.slice(6, 8)}`
  if (d.length > 8) out += `-${d.slice(8, 10)}`
  return out
}
