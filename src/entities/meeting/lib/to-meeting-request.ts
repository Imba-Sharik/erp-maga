import type { MeetingCreateRequest } from '@/shared/api/generated/types/MeetingCreateRequest'
import type { PatchedMeetingCreateUpdateRequest } from '@/shared/api/generated/types/PatchedMeetingCreateUpdateRequest'
import { buildBusinessDatetime } from '@/shared/lib/date'

import type { MeetingCreateFormValues, MeetingFormValues } from './meeting-form-schema'
import type { Meeting } from '../model/types'

export { buildBusinessDatetime as buildMeetingDatetime } from '@/shared/lib/date'

/** Создание встречи: начало (`time`) и обязательное окончание (`endTime`) → ISO МСК. */
export function toMeetingCreateRequest(
  values: MeetingCreateFormValues,
  date: string,
): MeetingCreateRequest {
  return {
    name: values.title,
    comment: values.comment,
    meeting_datetime: buildBusinessDatetime(date, values.time),
    meeting_end_datetime: buildBusinessDatetime(date, values.endTime),
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
