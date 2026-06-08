import { describe, expect, it } from 'vitest'

import { groupByDay, toDayKey } from './group-by-day'

describe('toDayKey', () => {
  it('форматирует дату как yyyy-MM-dd', () => {
    expect(toDayKey(new Date(2026, 5, 8))).toBe('2026-06-08')
  })
})

describe('groupByDay', () => {
  it('возвращает пустую map для пустого массива', () => {
    expect(groupByDay<{ date: string }>([], (item) => item.date).size).toBe(0)
  })

  it('группирует элементы по ключу даты', () => {
    const items = [
      { id: '1', date: '2026-06-01' },
      { id: '2', date: '2026-06-01' },
      { id: '3', date: '2026-06-02' },
    ]
    const map = groupByDay(items, (item) => item.date)

    expect(map.get('2026-06-01')).toEqual([
      { id: '1', date: '2026-06-01' },
      { id: '2', date: '2026-06-01' },
    ])
    expect(map.get('2026-06-02')).toEqual([{ id: '3', date: '2026-06-02' }])
  })
})
