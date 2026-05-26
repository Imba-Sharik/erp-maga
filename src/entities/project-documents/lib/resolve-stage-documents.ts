import type { DocumentStatus, StageFormData } from '@/entities/project'
import type { StageDocumentType } from '@/entities/stage-document-files'

import type { StageDocumentFile } from '../model/document-file'
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
  fileUrl?: string
  uploadedAt?: string
  uploadedBy?: string
}

export interface ResolveStageDocumentsOptions {
  /** Показывать слоты без имени файла (только статус). По умолчанию false. */
  includeEmpty?: boolean
}

interface ResolveSource {
  documentFiles?: Partial<Record<StageDocumentType, StageDocumentFile>>
}

export function resolveStageDocuments(
  source: ResolveSource | undefined,
  values?: Partial<StageFormData>,
  options?: ResolveStageDocumentsOptions,
): ProjectStageDocumentItem[] {
  const includeEmpty = options?.includeEmpty ?? false

  const items = STAGE_DOCUMENTS.map(({ documentType, label, fileNameKey, statusKey }) => {
    const meta = source?.documentFiles?.[documentType]
    const fileName = values?.[fileNameKey] || meta?.fileName
    const status = values?.[statusKey] as DocumentStatus | undefined
    return {
      documentType,
      label,
      fileName: fileName ?? '',
      status,
      variant: getStageDocumentFieldVariant(fileName, status),
      ...(meta?.fileUrl ? { fileUrl: meta.fileUrl } : {}),
      ...(meta?.uploadedAt ? { uploadedAt: meta.uploadedAt } : {}),
      ...(meta?.uploadedBy ? { uploadedBy: meta.uploadedBy } : {}),
    } satisfies ProjectStageDocumentItem
  })

  if (includeEmpty) return items
  return items.filter((item) => Boolean(item.fileName))
}
