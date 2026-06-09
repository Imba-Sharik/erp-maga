import { describe, expect, it } from 'vitest'

import {
  buildBusinessDatetime,
  formatBusinessDate,
  formatBusinessTime,
  parseBusinessDatetime,
} from './business-datetime'

describe('business-datetime', () => {
  it('buildBusinessDatetime добавляет offset МСК', () => {
    expect(buildBusinessDatetime('2026-06-10', '14:30')).toBe('2026-06-10T14:30:00+03:00')
  })

  it('formatBusinessTime читает UTC instant как московские часы', () => {
    expect(formatBusinessTime('2026-06-10T11:30:00Z')).toBe('14:30')
  })

  it('formatBusinessTime сохраняет время из offset +03:00', () => {
    expect(formatBusinessTime('2026-06-10T14:30:00+03:00')).toBe('14:30')
  })

  it('formatBusinessDate учитывает бизнес-таймзону у границы суток', () => {
    expect(formatBusinessDate('2026-06-10T21:30:00Z')).toBe('2026-06-11')
  })

  it('parseBusinessDatetime возвращает настенные date и time', () => {
    expect(parseBusinessDatetime('2026-06-10T11:30:00Z')).toEqual({
      date: '2026-06-10',
      time: '14:30',
    })
  })
})
