import type { ContactChannel, StageFormData } from '@/entities/project'
import type {
  PatchedPrimaryContactBlockUpdateRequest,
  PatchedPrimaryContactBlockUpdateRequestContactChannelEnumKey,
} from '@/shared/api/generated/types/PatchedPrimaryContactBlockUpdateRequest'

/**
 * UI-канал контакта (`phone`) → канонический бэковый (`call`); остальные совпадают.
 * Block-ручка PATCH /primary-contact/ принимает сырой enum ContactChannel
 * (call/meeting/messenger), в отличие от transition-эндпоинта (тот берёт `phone`).
 */
function channelToApi(
  channel: ContactChannel,
): PatchedPrimaryContactBlockUpdateRequestContactChannelEnumKey {
  return channel === 'phone' ? 'call' : channel
}

/**
 * UI → PATCH /projects/{id}/primary-contact/ (этап `primary_contact_done`, правка
 * руководителем задним числом). Оба поля опциональны (partial update).
 */
export function buildPrimaryContactPatchBody(
  values: Partial<StageFormData>,
): PatchedPrimaryContactBlockUpdateRequest | null {
  const body: PatchedPrimaryContactBlockUpdateRequest = {}
  if (values.contactChannel !== undefined) {
    body.contact_channel = channelToApi(values.contactChannel)
  }
  if (values.contactComment !== undefined) body.comment = values.contactComment
  return Object.keys(body).length > 0 ? body : null
}
