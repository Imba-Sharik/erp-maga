import type { MeetingCreateUpdateRequest } from '@/shared/api/generated/types/MeetingCreateUpdateRequest'
import type { PatchedMeetingCreateUpdateRequest } from '@/shared/api/generated/types/PatchedMeetingCreateUpdateRequest'
import { buildBusinessDatetime } from '@/shared/lib/date/business-datetime'

import type { MeetingFormValues } from './meeting-form-schema'
import type { Meeting } from '../model/types'

export { buildBusinessDatetime as buildMeetingDatetime } from '@/shared/lib/date/business-datetime'

export function toMeetingCreateRequest(
  values: MeetingFormValues,
  date: string,
): MeetingCreateUpdateRequest {
  return {
    name: values.title,
    comment: values.comment,
    meeting_datetime: buildBusinessDatetime(date, values.time),
    hall_ids: values.halls.map(Number),
  }
}

export function toMeetingUpdateRequest(
  values: MeetingFormValues,
  meeting: Meeting,
): PatchedMeetingCreateUpdateRequest {
  return {
    name: values.title,
    comment: values.comment,
    meeting_datetime: buildBusinessDatetime(meeting.date, values.time),
  }
}
