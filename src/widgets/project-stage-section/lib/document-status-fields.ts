import type { DocumentStatus } from '@/entities/project'
import {
  CONFIRMED_AT_TO_STATUS_FIELD,
  DOC_PAIR_BY_STATUS_FIELD,
  FILE_NAME_TO_STATUS_FIELD,
  getStageDocumentFieldVariant,
} from '@/entities/project-documents'

export type { StageDocumentFieldVariant } from '@/entities/project-documents'
export { getStageDocumentFieldVariant }
export { CONFIRMED_AT_TO_STATUS_FIELD, DOC_PAIR_BY_STATUS_FIELD, FILE_NAME_TO_STATUS_FIELD }

export function confirmedAtLabelForDocStatus(
  status: DocumentStatus | undefined,
  defaultLabel: string,
): string {
  return status === 're_requested' ? 'Дата повторного запроса документов' : defaultLabel
}
