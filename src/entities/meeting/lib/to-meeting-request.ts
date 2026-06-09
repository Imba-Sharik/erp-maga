import type { MeetingCreateUpdateRequest } from '@/shared/api/generated/types/MeetingCreateUpdateRequest'
import type { PatchedMeetingCreateUpdateRequest } from '@/shared/api/generated/types/PatchedMeetingCreateUpdateRequest'

import type { MeetingFormValues } from './meeting-form-schema'
import type { Meeting } from '../model/types'

/** Собирает ISO datetime из даты и времени без смещения таймзоны. */
export function buildMeetingDatetime(date: string, time: string): string {
  return `${date}T${time}:00`
}

export function toMeetingCreateRequest(
  values: MeetingFormValues,
  date: string,
): MeetingCreateUpdateRequest {
  return {
    name: values.title,
    comment: values.comment,
    meeting_datetime: buildMeetingDatetime(date, values.time),
  }
}

export function toMeetingUpdateRequest(
  values: MeetingFormValues,
  meeting: Meeting,
): PatchedMeetingCreateUpdateRequest {
  return {
    name: values.title,
    comment: values.comment,
    meeting_datetime: buildMeetingDatetime(meeting.date, values.time),
  }
}
