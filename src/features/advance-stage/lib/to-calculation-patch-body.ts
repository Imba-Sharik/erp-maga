import type { StageFormData } from '@/entities/project'
import type { PatchedCalculationBlockUpdateRequest } from '@/shared/api/generated/types/PatchedCalculationBlockUpdateRequest'

/**
 * UI → PATCH /projects/{id}/calculation/ (этап `calculation_prepared`, правка
 * руководителем задним числом). Персистит только комментарий к расчёту; файл сметы
 * загружается отдельной ручкой /calculation/file/.
 */
export function buildCalculationPatchBody(
  values: Partial<StageFormData>,
): PatchedCalculationBlockUpdateRequest | null {
  if (values.calcComment === undefined) return null
  return { comment: values.calcComment }
}
