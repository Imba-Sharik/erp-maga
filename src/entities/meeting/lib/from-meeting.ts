import type { Meeting as ApiMeeting } from '@/shared/api/generated/types/Meeting'

import type { Meeting } from '../model/types'
import { buildMeetingDatetime } from './to-meeting-request'

export function fromMeeting(api: ApiMeeting): Meeting {
  return {
    id: api.id,
    title: api.name,
    comment: api.comment,
    time: api.meeting_time,
    date: api.meeting_date,
    managerId: api.manager.id,
  }
}

export function mapBackendCalendarMeetings(list: readonly ApiMeeting[]): Meeting[] {
  return list.map(fromMeeting)
}

/** Минимальная API-форма для optimistic-обновлений кэша календаря. */
export function meetingToApiStub(meeting: Meeting): ApiMeeting {
  return {
    id: meeting.id,
    name: meeting.title,
    comment: meeting.comment,
    meeting_time: meeting.time,
    meeting_date: meeting.date,
    meeting_datetime: buildMeetingDatetime(meeting.date, meeting.time),
    manager: { id: meeting.managerId, full_name: '', email: '' },
    created_at: '',
    updated_at: '',
  }
}
