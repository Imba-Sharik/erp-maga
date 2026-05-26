import { resolveStageDocumentSource } from '@/entities/project-documents'
import type { StageDocumentType } from '@/entities/stage-document-files'

import { downloadBlob } from '../lib/download-blob'

interface DownloadStageDocumentArgs {
  projectId: string | number
  documentType: StageDocumentType
  fileName?: string
}

/**
 * Скачивание документа этапа. Пока — только локальный cache (zustand).
 * TODO: remote URL с API, когда появится endpoint.
 */
export function useDownloadStageDocument() {
  const download = ({ projectId, documentType, fileName }: DownloadStageDocumentArgs) => {
    const source = resolveStageDocumentSource(projectId, documentType, fileName)
    if (!source) {
      window.alert('Файл недоступен для скачивания.')
      return
    }
    if (source.kind === 'local') {
      downloadBlob(source.file, fileName ?? source.file.name)
      return
    }
    const anchor = document.createElement('a')
    anchor.href = source.url
    anchor.download = source.fileName
    anchor.rel = 'noopener'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
  }

  return { download }
}
