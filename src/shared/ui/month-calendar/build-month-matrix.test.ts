import { getDay, startOfMonth } from 'date-fns'
import { describe, expect, it } from 'vitest'

import { buildMonthMatrix } from './build-month-matrix'

describe('buildMonthMatrix', () => {
  it('начинает сетку с понедельника', () => {
    const days = buildMonthMatrix(new Date(2026, 5, 1))
    expect(getDay(days[0].date)).toBe(1)
  })

  it('помечает дни вне месяца', () => {
    // Март 2026 начинается в воскресенье — в сетке с ПН появятся дни февраля.
    const days = buildMonthMatrix(new Date(2026, 2, 1))
    const monthStart = startOfMonth(new Date(2026, 2, 1))

    expect(days.some((d) => d.outOfMonth && d.date < monthStart)).toBe(true)
    expect(days.some((d) => !d.outOfMonth && d.date >= monthStart)).toBe(true)
  })

  it('возвращает 35 или 42 ячейки (5–6 недель)', () => {
    const june2026 = buildMonthMatrix(new Date(2026, 5, 1))
    const feb2026 = buildMonthMatrix(new Date(2026, 1, 1))

    expect(june2026.length).toBeGreaterThanOrEqual(35)
    expect(june2026.length).toBeLessThanOrEqual(42)
    expect(feb2026.length).toBeGreaterThanOrEqual(35)
    expect(feb2026.length).toBeLessThanOrEqual(42)
  })

  it('формирует ключ yyyy-MM-dd', () => {
    const days = buildMonthMatrix(new Date(2026, 5, 15))
    const day15 = days.find((d) => d.dayNum === 15 && !d.outOfMonth)
    expect(day15?.key).toBe('2026-06-15')
  })
})
