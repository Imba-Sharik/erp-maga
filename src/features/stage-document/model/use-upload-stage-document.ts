import { stageDocumentFilesActions } from '@/entities/stage-document-files'
import type { StageDocumentType } from '@/entities/stage-document-files'

interface UploadStageDocumentArgs {
  projectId: string | number
  documentType: StageDocumentType
  file: File
}

/**
 * Заглушка загрузки документа на этапе documents_confirmed.
 * TODO: FormData + POST/PATCH, когда появится endpoint на бэке.
 */
export function useUploadStageDocument() {
  const upload = ({ projectId, documentType, file }: UploadStageDocumentArgs) => {
    stageDocumentFilesActions.set(projectId, documentType, file)
    // TODO: await api.uploadProjectDocument(projectId, documentType, file)
  }

  return { upload }
}
