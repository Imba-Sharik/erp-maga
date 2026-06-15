import type { StageFormData } from '@/entities/project'
import type { ClientBlockSchema } from '@/shared/api/generated/types/ClientBlockSchema'
import type { PatchedClientBlockUpdateRequest } from '@/shared/api/generated/types/PatchedClientBlockUpdateRequest'

/** UI → PATCH /projects/{id}/client/ */
export function buildClientPatchBody(
  values: Partial<StageFormData>,
): PatchedClientBlockUpdateRequest {
  if (values.magComment === undefined) return {}
  return { mag_comment: values.magComment }
}

/** Ответ PATCH client → поле этапа в UI. */
export function mapClientBlockToFormData(block: ClientBlockSchema): Partial<StageFormData> {
  return { magComment: block.comment }
}
