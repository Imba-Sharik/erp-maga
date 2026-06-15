import type { PatchedReminderCreateUpdateRequest } from '@/shared/api/generated/types/PatchedReminderCreateUpdateRequest'
import type { ReminderCreateUpdateRequest } from '@/shared/api/generated/types/ReminderCreateUpdateRequest'
import { buildBusinessDatetime } from '@/shared/lib/date/business-datetime'

import type { ReminderFormValues } from './reminder-form-schema'

export function toReminderCreateRequest(values: ReminderFormValues): ReminderCreateUpdateRequest {
  return {
    name: values.title,
    comment: values.comment,
    reminder_datetime: buildBusinessDatetime(values.date, values.time),
    is_telegram_reminder: values.notifyTelegram,
  }
}

export function toReminderUpdateRequest(
  values: ReminderFormValues,
): PatchedReminderCreateUpdateRequest {
  return {
    name: values.title,
    comment: values.comment,
    reminder_datetime: buildBusinessDatetime(values.date, values.time),
    is_telegram_reminder: values.notifyTelegram,
  }
}
