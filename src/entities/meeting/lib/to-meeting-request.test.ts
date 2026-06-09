import { describe, expect, it } from 'vitest'

import {
  buildMeetingDatetime,
  toMeetingCreateRequest,
  toMeetingUpdateRequest,
} from './to-meeting-request'
import type { Meeting } from '../model/types'

describe('to-meeting-request', () => {
  it('buildMeetingDatetime собирает ISO без смещения', () => {
    expect(buildMeetingDatetime('2026-06-10', '14:30')).toBe('2026-06-10T14:30:00')
  })

  it('toMeetingCreateRequest маппит поля формы', () => {
    expect(
      toMeetingCreateRequest(
        { title: 'Встреча', comment: 'Комментарий', time: '09:15' },
        '2026-06-12',
      ),
    ).toEqual({
      name: 'Встреча',
      comment: 'Комментарий',
      meeting_datetime: '2026-06-12T09:15:00',
    })
  })

  it('toMeetingUpdateRequest сохраняет дату встречи', () => {
    const meeting: Meeting = {
      id: 1,
      title: 'Старая',
      comment: 'Старый коммент',
      time: '10:00',
      date: '2026-06-15',
      managerId: 3,
    }

    expect(
      toMeetingUpdateRequest({ title: 'Новая', comment: 'Новый коммент', time: '11:45' }, meeting),
    ).toEqual({
      name: 'Новая',
      comment: 'Новый коммент',
      meeting_datetime: '2026-06-15T11:45:00',
    })
  })
})
