import type { DocumentStatus } from '@/entities/project'
import {
  DOC_PAIR_BY_STATUS_FIELD,
  FILE_NAME_TO_STATUS_FIELD,
  getStageDocumentFieldVariant,
  statusFieldForConfirmedAt,
} from '@/entities/project-document'

export type { StageDocumentFieldVariant } from '@/entities/project-document'
export { getStageDocumentFieldVariant }
export {
  statusFieldForConfirmedAt,
  DOC_PAIR_BY_STATUS_FIELD,
  FILE_NAME_TO_STATUS_FIELD,
}

export function confirmedAtLabelForDocStatus(
  status: DocumentStatus | undefined,
  defaultLabel: string,
): string {
  return status === 're_requested' ? 'Дата повторного запроса документов' : defaultLabel
}
