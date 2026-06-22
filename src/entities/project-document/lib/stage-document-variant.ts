import type { DocumentStatus } from '@/entities/project'

export type StageDocumentFieldVariant = 'empty' | 'uploaded' | 'rejected' | 'confirmed'

export interface StageDocumentVariantMeta {
  uploadedAt?: string
  confirmedAt?: string
  reuploadedAt?: string
}

function toTimestamp(value: string | undefined): number | undefined {
  if (!value) return undefined
  const ts = Date.parse(value)
  return Number.isNaN(ts) ? undefined : ts
}

function isUploadedAfterReRequest(meta?: StageDocumentVariantMeta): boolean {
  const confirmedTs = toTimestamp(meta?.confirmedAt)
  if (confirmedTs === undefined) return false

  for (const value of [meta?.uploadedAt, meta?.reuploadedAt]) {
    const ts = toTimestamp(value)
    if (ts !== undefined && ts >= confirmedTs) return true
  }
  return false
}

export function getStageDocumentFieldVariant(
  fileName: string | undefined,
  status: DocumentStatus | undefined,
  meta?: StageDocumentVariantMeta,
): StageDocumentFieldVariant {
  if (status === 'present' && fileName) return 'confirmed'
  if (status === 're_requested') {
    if (!fileName) return 'rejected'
    if (isUploadedAfterReRequest(meta)) return 'uploaded'
    return 'rejected'
  }
  if (fileName) return 'uploaded'
  return 'empty'
}
