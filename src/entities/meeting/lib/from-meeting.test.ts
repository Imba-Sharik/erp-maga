import { describe, expect, it } from 'vitest'

import { fromMeeting, mapBackendCalendarMeetings } from './from-meeting'

const apiMeeting = {
  id: 42,
  name: 'Созвон с клиентом',
  comment: 'Обсудить детали',
  meeting_datetime: '2026-06-10T14:30:00',
  meeting_date: '2026-06-10',
  meeting_time: '14:30',
  manager: { id: 7, full_name: 'Игорь Шарин', email: 'igor@example.com' },
  created_at: '2026-06-01T10:00:00Z',
  updated_at: '2026-06-01T10:00:00Z',
} as const

describe('fromMeeting', () => {
  it('маппит API Meeting в доменную модель', () => {
    expect(fromMeeting(apiMeeting)).toEqual({
      id: 42,
      title: 'Созвон с клиентом',
      comment: 'Обсудить детали',
      time: '14:30',
      date: '2026-06-10',
      managerId: 7,
    })
  })

  it('mapBackendCalendarMeetings маппит массив', () => {
    expect(mapBackendCalendarMeetings([apiMeeting])).toHaveLength(1)
    expect(mapBackendCalendarMeetings([apiMeeting])[0].title).toBe('Созвон с клиентом')
  })
})
