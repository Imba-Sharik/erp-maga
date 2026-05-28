import { useCallback, useEffect, useState } from 'react'

import type { StageDocumentType } from '@/entities/stage-document-files'

import {
  clearDocumentReupload,
  markDocumentReuploaded,
  readDocumentReuploadMarks,
} from '../lib/document-reupload-tracker'

export function useDocumentReuploadMarks(projectId: string | number) {
  const [marks, setMarks] = useState<Partial<Record<StageDocumentType, string>>>(() =>
    readDocumentReuploadMarks(projectId),
  )

  useEffect(() => {
    setMarks(readDocumentReuploadMarks(projectId))
  }, [projectId])

  const markReupload = useCallback(
    (documentType: StageDocumentType, at?: string) => {
      const stamped = markDocumentReuploaded(projectId, documentType, at)
      setMarks((prev) => ({ ...prev, [documentType]: stamped }))
      return stamped
    },
    [projectId],
  )

  const clearReupload = useCallback(
    (documentType: StageDocumentType) => {
      clearDocumentReupload(projectId, documentType)
      setMarks((prev) => {
        const next = { ...prev }
        delete next[documentType]
        return next
      })
    },
    [projectId],
  )

  return { marks, markReupload, clearReupload }
}
