import type { StageFormData } from '@/entities/project'
import type { ClientBlockSchema } from '@/shared/api/generated/types/ClientBlockSchema'
import type { PatchedClientBlockUpdateRequest } from '@/shared/api/generated/types/PatchedClientBlockUpdateRequest'

/**
 * UI → PATCH /projects/{id}/client/. Комментарий менеджера + идентификация клиента
 * (последнюю правит только Руководитель задним числом; после ручной правки
 * Plum-синхронизация её не перезаписывает).
 */
export function buildClientPatchBody(
  values: Partial<StageFormData>,
): PatchedClientBlockUpdateRequest {
  const body: PatchedClientBlockUpdateRequest = {}
  if (values.magComment !== undefined) body.mag_comment = values.magComment
  if (values.clientCompany !== undefined) body.client_company = values.clientCompany
  if (values.contactPerson !== undefined) body.contact_person = values.contactPerson
  if (values.phone !== undefined) body.phone = values.phone
  if (values.email !== undefined) body.email = values.email
  return body
}

/** Ответ PATCH client → поля этапа в UI. */
export function mapClientBlockToFormData(block: ClientBlockSchema): Partial<StageFormData> {
  return {
    magComment: block.comment,
    clientCompany: block.client_company,
    contactPerson: block.contact_person,
    phone: block.phone,
    email: block.email,
  }
}
