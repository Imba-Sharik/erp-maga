import type { DocumentStatus, StageFormData } from '@/entities/project'
import type { StageDocumentType } from '@/entities/stage-document-files'

export const DOC_PAIR_BY_STATUS_FIELD = {
  projectDocsStatus: {
    fileName: 'projectDocsFileName' as const,
    documentType: 'project_closing' as const,
  },
  subleaseDocsStatus: {
    fileName: 'subleaseDocsFileName' as const,
    documentType: 'subrent_closing' as const,
  },
  staffReceiptsStatus: {
    fileName: 'staffReceiptsFileName' as const,
    documentType: 'staff_receipts' as const,
  },
} satisfies Record<
  'projectDocsStatus' | 'subleaseDocsStatus' | 'staffReceiptsStatus',
  { fileName: keyof StageFormData; documentType: StageDocumentType }
>

export const FILE_NAME_TO_STATUS_FIELD = {
  projectDocsFileName: 'projectDocsStatus',
  subleaseDocsFileName: 'subleaseDocsStatus',
  staffReceiptsFileName: 'staffReceiptsStatus',
} as const satisfies Partial<Record<keyof StageFormData, keyof StageFormData>>

export const CONFIRMED_AT_TO_STATUS_FIELD: Partial<
  Record<keyof StageFormData, keyof StageFormData>
> = {
  projectDocsConfirmedAt: 'projectDocsStatus',
  subleaseDocsConfirmedAt: 'subleaseDocsStatus',
  staffReceiptsConfirmedAt: 'staffReceiptsStatus',
}

export type StageDocumentFieldVariant = 'empty' | 'uploaded' | 'rejected' | 'confirmed'

export function getStageDocumentFieldVariant(
  fileName: string | undefined,
  status: DocumentStatus | undefined,
): StageDocumentFieldVariant {
  if (status === 'present' && fileName) return 'confirmed'
  if (status === 're_requested' && fileName) return 'rejected'
  if (fileName) return 'uploaded'
  return 'empty'
}

export function confirmedAtLabelForDocStatus(
  status: DocumentStatus | undefined,
  defaultLabel: string,
): string {
  return status === 're_requested' ? 'Дата повторного запроса документов' : defaultLabel
}
