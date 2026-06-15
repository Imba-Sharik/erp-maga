import { describe, expect, it } from 'vitest'

import {
  formatMeetingVenueLabels,
  formatMeetingVenueLine,
  meetingHallsForHallIds,
} from './format-meeting-venue'
import type { MeetingHall } from '../model/types'

const halls: MeetingHall[] = [
  { hallId: 10, hallName: 'Зал A', loftId: 1, loftName: 'Лофт 1' },
  { hallId: 11, hallName: 'Зал B', loftId: 1, loftName: 'Лофт 1' },
  { hallId: 12, hallName: 'Зал C', loftId: 2, loftName: 'Лофт 2' },
]

describe('format-meeting-venue', () => {
  it('formatMeetingVenueLabels собирает уникальные лофты и залы', () => {
    expect(formatMeetingVenueLabels(halls)).toEqual({
      lofts: 'Лофт 1, Лофт 2',
      halls: 'Зал A, Зал B, Зал C',
    })
  })

  it('formatMeetingVenueLine объединяет лофты и залы через ·', () => {
    expect(formatMeetingVenueLine(halls)).toBe('Лофт 1, Лофт 2 · Зал A, Зал B, Зал C')
  })

  it('formatMeetingVenueLine возвращает пустую строку без залов', () => {
    expect(formatMeetingVenueLine([])).toBe('')
  })

  it('meetingHallsForHallIds сохраняет известные подписи', () => {
    expect(meetingHallsForHallIds(halls, [11, 99])).toEqual([
      { hallId: 11, hallName: 'Зал B', loftId: 1, loftName: 'Лофт 1' },
      { hallId: 99, hallName: '', loftId: null, loftName: '' },
    ])
  })
})
