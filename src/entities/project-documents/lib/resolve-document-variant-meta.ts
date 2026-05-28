import type { StageDocumentType } from '@/entities/stage-document-files'

import { getDocumentReuploadedAt } from './document-reupload-tracker'

export interface StageDocumentVariantMeta {
  uploadedAt?: string
  confirmedAt?: string
  reuploadedAt?: string
}

export function resolveDocumentVariantMeta(
  projectId: string | number,
  documentType: StageDocumentType,
  options: {
    uploadedAt?: string
    confirmedAt?: string
    reuploadedAt?: string
  },
): StageDocumentVariantMeta {
  return {
    uploadedAt: options.uploadedAt,
    confirmedAt: options.confirmedAt,
    reuploadedAt: options.reuploadedAt ?? getDocumentReuploadedAt(projectId, documentType),
  }
}
