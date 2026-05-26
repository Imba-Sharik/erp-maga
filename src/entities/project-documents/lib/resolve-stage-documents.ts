import type { DocumentStatus, StageFormData } from '@/entities/project'
import { stageDocumentFilesActions } from '@/entities/stage-document-files'
import type { StageDocumentType } from '@/entities/stage-document-files'

import { STAGE_DOCUMENTS } from './stage-document-registry'
import {
  getStageDocumentFieldVariant,
  type StageDocumentFieldVariant,
} from './stage-document-variant'

export interface ProjectStageDocumentItem {
  documentType: StageDocumentType
  label: string
  fileName: string
  status?: DocumentStatus
  variant: StageDocumentFieldVariant
}

export interface ResolveStageDocumentsOptions {
  /** Показывать слоты без имени файла (только статус). По умолчанию false. */
  includeEmpty?: boolean
}

export function resolveStageDocuments(
  projectId: string | number,
  values?: Partial<StageFormData>,
  options?: ResolveStageDocumentsOptions,
): ProjectStageDocumentItem[] {
  const includeEmpty = options?.includeEmpty ?? false

  const items = STAGE_DOCUMENTS.map(({ documentType, label, fileNameKey, statusKey }) => {
    const file = stageDocumentFilesActions.get(projectId, documentType)
    const fileName = values?.[fileNameKey] || file?.name
    const status = values?.[statusKey] as DocumentStatus | undefined
    return {
      documentType,
      label,
      fileName: fileName ?? '',
      status,
      variant: getStageDocumentFieldVariant(fileName, status),
    }
  })

  if (includeEmpty) return items
  return items.filter((item) => Boolean(item.fileName))
}
