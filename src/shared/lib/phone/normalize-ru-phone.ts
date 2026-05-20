/**
 * Приводит произвольный ввод телефона к формату E.164 для России (`+7XXXXXXXXXX`).
 * Принимает 11 цифр с кодом страны `7`/`8` или 10 цифр без кода.
 * Возвращает `null`, если строка не похожа на российский номер.
 */
export function normalizeRuPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return null

  let local = digits
  if (digits.length === 11 && (digits[0] === '7' || digits[0] === '8')) {
    local = digits.slice(1)
  }
  if (local.length !== 10) return null

  return `+7${local}`
}
