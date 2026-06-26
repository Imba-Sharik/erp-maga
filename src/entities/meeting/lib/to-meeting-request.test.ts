import { describe, expect, it } from 'vitest'

import {
  buildMeetingDatetime,
  toMeetingCreateRequest,
  toMeetingUpdateRequest,
} from './to-meeting-request'
import type { Meeting } from '../model/types'

describe('to-meeting-request', () => {
  it('buildMeetingDatetime добавляет offset МСК', () => {
    expect(buildMeetingDatetime('2026-06-10', '14:30')).toBe('2026-06-10T14:30:00+03:00')
  })

  it('toMeetingCreateRequest маппит поля формы и залы', () => {
    expect(
      toMeetingCreateRequest(
        {
          title: 'Встреча',
          eventType: 'meeting',
          comment: 'Комментарий',
          time: '09:15',
          lofts: ['1'],
          halls: ['10', '11'],
        },
        '2026-06-12',
      ),
    ).toEqual({
      name: 'Встреча',
      type: 'meeting',
      comment: 'Комментарий',
      meeting_datetime: '2026-06-12T09:15:00+03:00',
      hall_ids: [10, 11],
    })
  })

  it('toMeetingUpdateRequest сохраняет дату встречи и залы', () => {
    const meeting: Meeting = {
      id: 1,
      title: 'Старая',
      eventType: 'meeting',
      comment: 'Старый коммент',
      time: '10:00',
      date: '2026-06-15',
      managerId: 3,
      halls: [],
    }

    expect(
      toMeetingUpdateRequest(
        {
          title: 'Новая',
          eventType: 'meeting',
          comment: 'Новый коммент',
          time: '11:45',
          lofts: ['1'],
          halls: ['10', '11'],
        },
        meeting,
      ),
    ).toEqual({
      name: 'Новая',
      type: 'meeting',
      comment: 'Новый коммент',
      meeting_datetime: '2026-06-15T11:45:00+03:00',
      hall_ids: [10, 11],
    })
  })
})
