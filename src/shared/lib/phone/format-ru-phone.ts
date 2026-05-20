import { extractLocalDigits } from './extract-local-digits'

/**
 * Собирает маску `+7 (XXX) XXX-XX-XX` из уже выделенных локальных цифр (до 10).
 * В отличие от `formatRuPhone`, ведущие `7`/`8` НЕ отбрасываются — на вход
 * ожидаются именно локальные цифры номера.
 */
export function formatLocalDigits(local: string): string {
  const d = local.slice(0, 10)
  if (!d) return ''

  let out = `+7 (${d.slice(0, 3)}`
  if (d.length >= 3) out += ')'
  if (d.length > 3) out += ` ${d.slice(3, 6)}`
  if (d.length > 6) out += `-${d.slice(6, 8)}`
  if (d.length > 8) out += `-${d.slice(8, 10)}`
  return out
}

/**
 * Форматирует произвольный ввод под маску `+7 (XXX) XXX-XX-XX`.
 * Частичный ввод даёт частичную маску; пустая строка — пустой результат.
 */
export function formatRuPhone(raw: string): string {
  return formatLocalDigits(extractLocalDigits(raw))
}
