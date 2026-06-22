import { describe, expect, it } from 'vitest'

import { getInclusiveDateRange, mergeDates, removeDates } from './date-range'

function localDate(year: number, month: number, day: number) {
  return new Date(year, month - 1, day)
}

describe('getInclusiveDateRange', () => {
  it('возвращает все дни включительно', () => {
    const range = getInclusiveDateRange(localDate(2026, 6, 3), localDate(2026, 6, 5))
    expect(range).toHaveLength(3)
    expect(range[0].getDate()).toBe(3)
    expect(range[2].getDate()).toBe(5)
  })
})

describe('mergeDates', () => {
  it('добавляет новые даты и сортирует', () => {
    const base = [localDate(2026, 6, 10)]
    const merged = mergeDates(base, [localDate(2026, 6, 5), localDate(2026, 6, 12)])
    expect(merged.map((d) => d.getDate())).toEqual([5, 10, 12])
  })

  it('не дублирует уже выбранные даты', () => {
    const base = [localDate(2026, 6, 10)]
    const merged = mergeDates(base, [localDate(2026, 6, 10)])
    expect(merged).toHaveLength(1)
  })
})

describe('removeDates', () => {
  it('снимает только указанные дни', () => {
    const base = [localDate(2026, 6, 5), localDate(2026, 6, 10), localDate(2026, 6, 12)]
    const result = removeDates(base, [localDate(2026, 6, 10)])
    expect(result.map((d) => d.getDate())).toEqual([5, 12])
  })
})
