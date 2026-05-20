import { normalizeRuPhone } from './normalize-ru-phone'

/** Проверяет, что строка — валидный российский номер телефона. */
export function isValidRuPhone(raw: string): boolean {
  return normalizeRuPhone(raw) !== null
}
