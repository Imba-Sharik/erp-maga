import { describe, expect, it } from 'vitest'

import { fromMeeting, mapBackendCalendarMeetings } from './from-meeting'

describe('fromMeeting', () => {
  it('маппит API Meeting с явным offset МСК и залы', () => {
    expect(
      fromMeeting({
        id: 42,
        name: 'Созвон с клиентом',
        type: 'meeting',
        comment: 'Обсудить детали',
        meeting_datetime: '2026-06-10T14:30:00+03:00',
        meeting_end_datetime: '2026-06-10T15:30:00+03:00',
        meeting_date: '2026-06-10',
        meeting_time: '14:30',
        halls: [
          { hall_id: 10, hall_name: 'Зал A', loft_id: 1, loft_name: 'Лофт 1' },
          { hall_id: 11, hall_name: 'Зал B', loft_id: null, loft_name: '' },
        ],
        manager: { id: 7, full_name: 'Игорь Шарин', email: 'igor@example.com' },
        created_at: '2026-06-01T10:00:00Z',
        updated_at: '2026-06-01T10:00:00Z',
      }),
    ).toEqual({
      id: 42,
      title: 'Созвон с клиентом',
      eventType: 'meeting',
      comment: 'Обсудить детали',
      time: '14:30',
      date: '2026-06-10',
      managerId: 7,
      halls: [
        { hallId: 10, hallName: 'Зал A', loftId: 1, loftName: 'Лофт 1' },
        { hallId: 11, hallName: 'Зал B', loftId: null, loftName: '' },
      ],
    })
  })

  it('нормализует UTC instant в московское настенное время', () => {
    expect(
      fromMeeting({
        id: 1,
        name: 'Встреча',
        type: null,
        comment: 'Тест',
        meeting_datetime: '2026-06-10T11:30:00Z',
        meeting_end_datetime: null,
        meeting_date: '2026-06-10',
        meeting_time: '11:30',
        halls: [],
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
        type: null,
        comment: 'Детали',
        meeting_datetime: '2026-06-10T14:30:00+03:00',
        meeting_end_datetime: null,
        meeting_date: '2026-06-10',
        meeting_time: '14:30',
        halls: [],
        manager: { id: 7, full_name: 'Игорь', email: 'i@example.com' },
        created_at: '',
        updated_at: '',
      },
    ]

    expect(mapBackendCalendarMeetings(list)).toHaveLength(1)
    expect(mapBackendCalendarMeetings(list)[0].title).toBe('Созвон')
  })
})
