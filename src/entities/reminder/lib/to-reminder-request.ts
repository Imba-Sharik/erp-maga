import type { PatchedReminderCreateUpdateRequest } from '@/shared/api/generated/types/PatchedReminderCreateUpdateRequest'
import type { ReminderCreateUpdateRequest } from '@/shared/api/generated/types/ReminderCreateUpdateRequest'
import { buildBusinessDatetime } from '@/shared/lib/date'

import type { ReminderFormValues } from './reminder-form-schema'

// Тип события (`values.eventType`, ERP-215) пока в запрос не уходит — на бэке нет
// поля. Когда появится — добавляем его сюда и в toReminderUpdateRequest.
export function toReminderCreateRequest(
  values: ReminderFormValues,
  projectId?: number | null,
): ReminderCreateUpdateRequest {
  return {
    name: values.title,
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
    comment: values.comment,
    reminder_datetime: buildBusinessDatetime(values.date, values.time),
    is_telegram_reminder: values.notifyTelegram,
  }
}
