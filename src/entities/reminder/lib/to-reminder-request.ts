import type { PatchedReminderCreateUpdateRequest } from '@/shared/api/generated/types/PatchedReminderCreateUpdateRequest'
import type { ReminderCreateUpdateRequest } from '@/shared/api/generated/types/ReminderCreateUpdateRequest'
import { buildBusinessDatetime } from '@/shared/lib/date'

import type { ReminderFormValues } from './reminder-form-schema'

export function toReminderCreateRequest(
  values: ReminderFormValues,
  projectId?: number | null,
): ReminderCreateUpdateRequest {
  return {
    name: values.title,
    type: values.eventType as ReminderCreateUpdateRequest['type'],
    comment: values.comment,
    reminder_datetime: buildBusinessDatetime(values.date, values.time),
    is_telegram_reminder: values.notifyTelegram,
    ...(projectId != null ? { project_id: projectId } : {}),
  }
}

export function toReminderUpdateRequest(
  values: ReminderFormValues,
): PatchedReminderCreateUpdateRequest {
  return {
    name: values.title,
    type: values.eventType as PatchedReminderCreateUpdateRequest['type'],
    comment: values.comment,
    reminder_datetime: buildBusinessDatetime(values.date, values.time),
    is_telegram_reminder: values.notifyTelegram,
  }
}
