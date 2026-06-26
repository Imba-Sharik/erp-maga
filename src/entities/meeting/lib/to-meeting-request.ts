import type { MeetingCreateRequest } from '@/shared/api/generated/types/MeetingCreateRequest'
import type { PatchedMeetingCreateUpdateRequest } from '@/shared/api/generated/types/PatchedMeetingCreateUpdateRequest'
import { buildBusinessDatetime } from '@/shared/lib/date'

import type { MeetingFormValues } from './meeting-form-schema'
import type { Meeting } from '../model/types'

export { buildBusinessDatetime as buildMeetingDatetime } from '@/shared/lib/date'

// Тип события (`values.eventType`, ERP-215) пока в запрос не уходит — на бэке нет
// поля. Когда появится — добавляем его в тело здесь и в toMeetingUpdateRequest.
export function toMeetingCreateRequest(
  values: MeetingFormValues,
  date: string,
): MeetingCreateRequest {
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
    hall_ids: values.halls.map(Number),
  }
}
