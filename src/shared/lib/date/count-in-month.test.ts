import { describe, expect, it } from 'vitest'

import { countItemsInMonth } from './count-in-month'

describe('countItemsInMonth', () => {
  it('считает только дни выбранного месяца', () => {
    const itemsByDay = new Map<string, string[]>([
      ['2026-05-31', ['a']],
      ['2026-06-01', ['b', 'c']],
      ['2026-06-15', ['d']],
      ['2026-07-01', ['e']],
    ])

    expect(countItemsInMonth(itemsByDay, new Date(2026, 5, 10))).toBe(3)
  })

  it('возвращает 0 для пустой карты', () => {
    expect(countItemsInMonth(new Map(), new Date(2026, 0, 1))).toBe(0)
  })
})
