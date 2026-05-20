/**
 * Достаёт «локальную» часть российского номера — до 10 цифр без кода страны.
 * Ведущая `7`/`8` трактуется как код страны / выход на межгород и отбрасывается
 * (локальные номера РФ с них не начинаются). Подходит для частичного ввода под маску.
 */
export function extractLocalDigits(raw: string): string {
  let digits = raw.replace(/\D/g, '')
  if (digits[0] === '7' || digits[0] === '8') {
    digits = digits.slice(1)
  }
  return digits.slice(0, 10)
}
