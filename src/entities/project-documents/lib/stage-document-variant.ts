import type { DocumentStatus } from '@/entities/project'

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
