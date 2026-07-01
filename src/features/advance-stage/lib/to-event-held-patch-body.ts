import type { StageFormData } from '@/entities/project'
import type { PatchedEventHeldBlockUpdateRequest } from '@/shared/api/generated/types/PatchedEventHeldBlockUpdateRequest'

/**
 * UI → PATCH /projects/{id}/event-held/ (этап `event_held`, правка задним числом).
 * Персистит только «Комментарий после мероприятия» (`Project.post_event_comment`) —
 * это ДРУГОЕ поле, чем «Комментарий к расходам» (`ExpenseBlock.comment`), которое
 * правится через `/expenses/`.
 */
export function buildEventHeldPatchBody(
  values: Partial<StageFormData>,
): PatchedEventHeldBlockUpdateRequest | null {
  if (values.postEventComment === undefined) return null
  return { post_event_comment: values.postEventComment }
}
