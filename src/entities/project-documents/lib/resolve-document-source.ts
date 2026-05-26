import { stageDocumentFilesActions } from '@/entities/stage-document-files'
import type { StageDocumentType } from '@/entities/stage-document-files'

export type StageDocumentSource =
  | { kind: 'local'; file: File }
  | { kind: 'remote'; url: string; fileName: string }

/**
 * Источник файла для скачивания: пока только локальный zustand-cache.
 * TODO: remote URL с API, когда появится endpoint скачивания.
 */
export function resolveStageDocumentSource(
  projectId: string | number,
  documentType: StageDocumentType,
  _fileNameFromSnapshot?: string,
): StageDocumentSource | undefined {
  const file = stageDocumentFilesActions.get(projectId, documentType)
  if (!file) return undefined
  return { kind: 'local', file }
}
