import { STAGE_DOCUMENTS } from '@/entities/project-documents'
import type { StageDocumentType } from '@/entities/stage-document-files'

export const DOCUMENT_TYPE_LABELS = Object.fromEntries(
  STAGE_DOCUMENTS.map((doc) => [doc.documentType, doc.label]),
) as Record<StageDocumentType, string>

const DOCUMENT_FIELD_PREFIX = 'document.'

export function documentTypeFromAuditField(fieldName: string): StageDocumentType | undefined {
  if (!fieldName.startsWith(DOCUMENT_FIELD_PREFIX)) return undefined
  const code = fieldName.slice(DOCUMENT_FIELD_PREFIX.length)
  return code in DOCUMENT_TYPE_LABELS ? (code as StageDocumentType) : undefined
}
