import type { MeetingCreateRequest } from '@/shared/api/generated/types/MeetingCreateRequest'
import type { PatchedMeetingCreateUpdateRequest } from '@/shared/api/generated/types/PatchedMeetingCreateUpdateRequest'
import { buildBusinessDatetime } from '@/shared/lib/date'

import type { MeetingFormValues } from './meeting-form-schema'
import type { Meeting } from '../model/types'

export { buildBusinessDatetime as buildMeetingDatetime } from '@/shared/lib/date'

/**
 * Форма создания собирает и время окончания (`endTime`), но бэк хранит только
 * `meeting_datetime` (начало) — поэтому в запрос уходит лишь начало. Когда на
 * бэке появится поле окончания, добавляем его сюда из `values.endTime`.
 */
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
