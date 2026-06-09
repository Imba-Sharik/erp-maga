import { describe, expect, it } from 'vitest'

import { fromMeeting, mapBackendCalendarMeetings } from './from-meeting'

describe('fromMeeting', () => {
  it('маппит API Meeting с явным offset МСК', () => {
    expect(
      fromMeeting({
        id: 42,
        name: 'Созвон с клиентом',
        comment: 'Обсудить детали',
        meeting_datetime: '2026-06-10T14:30:00+03:00',
        meeting_date: '2026-06-10',
        meeting_time: '14:30',
        manager: { id: 7, full_name: 'Игорь Шарин', email: 'igor@example.com' },
        created_at: '2026-06-01T10:00:00Z',
        updated_at: '2026-06-01T10:00:00Z',
      }),
    ).toEqual({
      id: 42,
      title: 'Созвон с клиентом',
      comment: 'Обсудить детали',
      time: '14:30',
      date: '2026-06-10',
      managerId: 7,
    })
  })

  it('нормализует UTC instant в московское настенное время', () => {
    expect(
      fromMeeting({
        id: 1,
        name: 'Встреча',
        comment: 'Тест',
        meeting_datetime: '2026-06-10T11:30:00Z',
        meeting_date: '2026-06-10',
        meeting_time: '11:30',
        manager: { id: 2, full_name: 'Тест', email: 't@example.com' },
        created_at: '2026-06-01T10:00:00Z',
        updated_at: '2026-06-01T10:00:00Z',
      }),
    ).toMatchObject({
      time: '14:30',
      date: '2026-06-10',
    })
  })

  it('mapBackendCalendarMeetings маппит массив', () => {
    const list = [
      {
        id: 42,
        name: 'Созвон',
        comment: 'Детали',
        meeting_datetime: '2026-06-10T14:30:00+03:00',
        meeting_date: '2026-06-10',
        meeting_time: '14:30',
        manager: { id: 7, full_name: 'Игорь', email: 'i@example.com' },
        created_at: '',
        updated_at: '',
      },
    ]

    expect(mapBackendCalendarMeetings(list)).toHaveLength(1)
    expect(mapBackendCalendarMeetings(list)[0].title).toBe('Созвон')
  })
})
