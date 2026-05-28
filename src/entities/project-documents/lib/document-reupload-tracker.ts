import type { StageDocumentType } from '@/entities/stage-document-files'

import { STAGE_DOCUMENTS } from './stage-document-registry'

const PREFIX = 'erp:doc-reupload:'

function storageKey(projectId: string | number, documentType: StageDocumentType): string {
  return `${PREFIX}${projectId}:${documentType}`
}

/** Фиксируем повторную загрузку после `re_requested` — переживает reload вкладки. */
export function markDocumentReuploaded(
  projectId: string | number,
  documentType: StageDocumentType,
  at: string = new Date().toISOString(),
): string {
  try {
    sessionStorage.setItem(storageKey(projectId, documentType), at)
  } catch {
    // sessionStorage недоступен — работаем только с in-memory состоянием вызывающего кода.
  }
  return at
}

export function getDocumentReuploadedAt(
  projectId: string | number,
  documentType: StageDocumentType,
): string | undefined {
  try {
    return sessionStorage.getItem(storageKey(projectId, documentType)) ?? undefined
  } catch {
    return undefined
  }
}

export function clearDocumentReupload(
  projectId: string | number,
  documentType: StageDocumentType,
): void {
  try {
    sessionStorage.removeItem(storageKey(projectId, documentType))
  } catch {
    // ignore
  }
}

export function readDocumentReuploadMarks(
  projectId: string | number,
): Partial<Record<StageDocumentType, string>> {
  const marks: Partial<Record<StageDocumentType, string>> = {}
  for (const { documentType } of STAGE_DOCUMENTS) {
    const at = getDocumentReuploadedAt(projectId, documentType)
    if (at) marks[documentType] = at
  }
  return marks
}
