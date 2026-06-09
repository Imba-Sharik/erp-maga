import { tz } from '@date-fns/tz'

/**
 * Операционный часовой пояс MAG: встречи и события привязаны к московскому
 * «настенному» времени, не к timezone браузера пользователя.
 */
export const BUSINESS_TIMEZONE = 'Europe/Moscow' as const

/** Фиксированный offset МСК (DST в РФ отменён с 2014). */
export const BUSINESS_TIMEZONE_OFFSET = '+03:00' as const

/** Контекст `in` для date-fns v4. */
export const businessTimezone = tz(BUSINESS_TIMEZONE)
