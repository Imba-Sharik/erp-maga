import type { Meeting as ApiMeeting } from '@/shared/api/generated/types/Meeting'
import {
  buildBusinessDatetime,
  formatBusinessDate,
  formatBusinessTime,
} from '@/shared/lib/date/business-datetime'

import type { Meeting } from '../model/types'

export function fromMeeting(api: ApiMeeting): Meeting {
  const date = api.meeting_datetime ? formatBusinessDate(api.meeting_datetime) : api.meeting_date
  const time = api.meeting_datetime ? formatBusinessTime(api.meeting_datetime) : api.meeting_time

  return {
    id: api.id,
    title: api.name,
    comment: api.comment,
    time,
    date,
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
    meeting_datetime: buildBusinessDatetime(meeting.date, meeting.time),
    manager: { id: meeting.managerId, full_name: '', email: '' },
    created_at: '',
    updated_at: '',
  }
}
