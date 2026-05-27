import { describe, expect, it } from 'vitest'

import { formatRelativeUpdateLabel } from './format-relative-update-label'

/** Локальная дата → ISO (как с бэка), без привязки к UTC в assertions времени. */
function localIso(year: number, month: number, day: number, hour = 0, minute = 0, second = 0) {
  return new Date(year, month - 1, day, hour, minute, second).toISOString()
}

function localNow(year: number, month: number, day: number, hour = 0, minute = 0, second = 0) {
  return new Date(year, month - 1, day, hour, minute, second)
}

describe('formatRelativeUpdateLabel', () => {
  const now = localNow(2026, 5, 27, 14, 0, 0)

  it('возвращает пустую строку для пустого или невалидного ISO', () => {
    expect(formatRelativeUpdateLabel('', now)).toBe('')
    expect(formatRelativeUpdateLabel('not-a-date', now)).toBe('')
  })

  it('возвращает пустую строку для даты в будущем', () => {
    expect(formatRelativeUpdateLabel(localIso(2026, 5, 27, 15, 0), now)).toBe('')
  })

  it('округляет интервал меньше минуты до 1м назад', () => {
    expect(formatRelativeUpdateLabel(localIso(2026, 5, 27, 13, 59, 30), now)).toBe('1м назад')
    expect(formatRelativeUpdateLabel(localIso(2026, 5, 27, 14, 0, 0), now)).toBe('1м назад')
  })

  it('показывает минуты для обновлений сегодня (< 60 мин)', () => {
    expect(formatRelativeUpdateLabel(localIso(2026, 5, 27, 13, 13), now)).toBe('47м назад')
    expect(formatRelativeUpdateLabel(localIso(2026, 5, 27, 13, 1), now)).toBe('59м назад')
  })

  it('показывает часы для обновлений сегодня (>= 60 мин)', () => {
    expect(formatRelativeUpdateLabel(localIso(2026, 5, 27, 13, 0), now)).toBe('1ч назад')
    expect(formatRelativeUpdateLabel(localIso(2026, 5, 27, 11, 0), now)).toBe('3ч назад')
  })

  it('показывает «Вчера в HH:mm» для вчерашнего календарного дня', () => {
    expect(formatRelativeUpdateLabel(localIso(2026, 5, 26, 15, 23), now)).toBe('Вчера в 15:23')
    expect(formatRelativeUpdateLabel(localIso(2026, 5, 26, 23, 59), now)).toBe('Вчера в 23:59')
  })

  it('показывает дни для 2+ календарных дней назад', () => {
    expect(formatRelativeUpdateLabel(localIso(2026, 5, 25, 12, 0), now)).toBe('2д назад')
    expect(formatRelativeUpdateLabel(localIso(2026, 3, 28, 12, 0), now)).toBe('60д назад')
    expect(formatRelativeUpdateLabel(localIso(2025, 5, 27, 12, 0), now)).toBe('365д назад')
  })
})
