import type { StageFormData } from '@/entities/project'
import type { StageDocumentType } from '@/entities/stage-document-files'

/** Имя поля формы → тип документа в API. */
export const FIELD_TO_DOCUMENT_TYPE = {
  projectDocsFileName: 'project_closing',
  subleaseDocsFileName: 'subrent_closing',
  staffReceiptsFileName: 'staff_receipts',
} as const satisfies Partial<Record<keyof StageFormData, StageDocumentType>>

export function documentTypeFromFieldName(
  fieldName: keyof StageFormData,
): StageDocumentType | undefined {
  return FIELD_TO_DOCUMENT_TYPE[fieldName as keyof typeof FIELD_TO_DOCUMENT_TYPE]
}
