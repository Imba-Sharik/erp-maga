import { describe, expect, it } from 'vitest'

import { isEventDatePassed } from './is-event-date-passed'

const NOW = new Date(2026, 5, 25) // 2026-06-25

describe('isEventDatePassed', () => {
  it('дата в прошлом → true', () => {
    expect(isEventDatePassed({ date: '2026-06-01' }, NOW)).toBe(true)
  })

  it('сегодняшняя дата → false (день ещё не прошёл)', () => {
    expect(isEventDatePassed({ date: '2026-06-25' }, NOW)).toBe(false)
  })

  it('дата в будущем → false', () => {
    expect(isEventDatePassed({ date: '2026-07-01' }, NOW)).toBe(false)
  })

  it('пустая дата → false', () => {
    expect(isEventDatePassed({ date: '' }, NOW)).toBe(false)
  })

  it('некорректная дата → false', () => {
    expect(isEventDatePassed({ date: 'не-дата' }, NOW)).toBe(false)
  })
})
