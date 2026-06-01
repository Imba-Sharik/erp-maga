import type { StageDocumentFieldVariant } from '@/entities/project-documents'

import type { StageDocumentInteraction } from './document-interaction'

export type StageDocumentFieldDisplay =
  | 'file-row'
  | 'upload-button'
  | 'placeholder-empty'
  | 'placeholder-rejected'

export function resolveStageDocumentFieldDisplay(
  variant: StageDocumentFieldVariant,
  value: string,
  interaction: StageDocumentInteraction,
): StageDocumentFieldDisplay | null {
  const isUpload = interaction === 'upload'
  const showFileRow =
    variant === 'uploaded' || variant === 'confirmed' || (variant === 'rejected' && Boolean(value))

  if (showFileRow) return 'file-row'
  if (isUpload) return 'upload-button'
  if (variant === 'rejected') return 'placeholder-rejected'
  if (variant === 'empty') return 'placeholder-empty'
  return null
}
