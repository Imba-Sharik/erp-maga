import type { DocumentStatus, StageFormData } from '@/entities/project'
import type { StageDocumentType } from '@/entities/stage-document-files'

export const STAGE_DOCUMENTS = [
  {
    documentType: 'project_closing',
    label: 'Закрывающие по проекту',
    fileNameKey: 'projectDocsFileName',
    statusKey: 'projectDocsStatus',
    confirmedAtKey: 'projectDocsConfirmedAt',
    confirmedByKey: 'projectDocsConfirmedBy',
  },
  {
    documentType: 'subrent_closing',
    label: 'Закрывающие по субаренде',
    fileNameKey: 'subleaseDocsFileName',
    statusKey: 'subleaseDocsStatus',
    confirmedAtKey: 'subleaseDocsConfirmedAt',
    confirmedByKey: 'subleaseDocsConfirmedBy',
  },
  {
    documentType: 'staff_receipts',
    label: 'Расписки по персоналу',
    fileNameKey: 'staffReceiptsFileName',
    statusKey: 'staffReceiptsStatus',
    confirmedAtKey: 'staffReceiptsConfirmedAt',
    confirmedByKey: 'staffReceiptsConfirmedBy',
  },
] as const satisfies ReadonlyArray<{
  documentType: StageDocumentType
  label: string
  fileNameKey: keyof StageFormData
  statusKey: keyof StageFormData
  confirmedAtKey: keyof StageFormData
  confirmedByKey: keyof StageFormData
}>

export type StageDocumentDefinition = (typeof STAGE_DOCUMENTS)[number]

export type StageDocumentStatusField = StageDocumentDefinition['statusKey']
export type StageDocumentFileNameField = StageDocumentDefinition['fileNameKey']

export const DOCUMENT_STATUS_OPTIONS = [
  { value: 'present', label: 'Есть' },
  { value: 'absent', label: 'Нет' },
  { value: 'not_required', label: 'Не требуется' },
  { value: 're_requested', label: 'Запросить повторно' },
] as const satisfies ReadonlyArray<{ value: DocumentStatus; label: string }>

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = Object.fromEntries(
  DOCUMENT_STATUS_OPTIONS.map((o) => [o.value, o.label]),
) as Record<DocumentStatus, string>

export const DOC_PAIR_BY_STATUS_FIELD = Object.fromEntries(
  STAGE_DOCUMENTS.map((d) => [
    d.statusKey,
    { fileName: d.fileNameKey, documentType: d.documentType },
  ]),
) as Record<
  StageDocumentStatusField,
  { fileName: StageDocumentFileNameField; documentType: StageDocumentType }
>

export const FILE_NAME_TO_STATUS_FIELD = Object.fromEntries(
  STAGE_DOCUMENTS.map((d) => [d.fileNameKey, d.statusKey]),
) as Record<StageDocumentFileNameField, StageDocumentStatusField>

export const FIELD_TO_DOCUMENT_TYPE = Object.fromEntries(
  STAGE_DOCUMENTS.map((d) => [d.fileNameKey, d.documentType]),
) as Record<StageDocumentFileNameField, StageDocumentType>

export const CONFIRMED_AT_TO_STATUS_FIELD = Object.fromEntries(
  STAGE_DOCUMENTS.map((d) => [d.confirmedAtKey, d.statusKey]),
) as Record<StageDocumentDefinition['confirmedAtKey'], StageDocumentStatusField>

export const STATUS_CONFIRM_META_BY_STATUS = Object.fromEntries(
  STAGE_DOCUMENTS.map((d) => [
    d.statusKey,
    { atField: d.confirmedAtKey, byField: d.confirmedByKey },
  ]),
) as Record<
  StageDocumentStatusField,
  {
    atField: StageDocumentDefinition['confirmedAtKey']
    byField: StageDocumentDefinition['confirmedByKey']
  }
>

export function documentTypeFromFieldName(
  fieldName: keyof StageFormData,
): StageDocumentType | undefined {
  return FIELD_TO_DOCUMENT_TYPE[fieldName as StageDocumentFileNameField]
}

/** @deprecated Use STAGE_DOCUMENTS */
export const STAGE_DOCUMENT_SLOTS = STAGE_DOCUMENTS

/** @deprecated Use StageDocumentDefinition */
export type StageDocumentSlot = StageDocumentDefinition
