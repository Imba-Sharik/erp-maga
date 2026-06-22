import { useMutation } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import type { StageDocumentType } from '@/entities/stage-document-files'
import { client } from '@/shared/api'

import { downloadBlob } from '../lib/download-blob'

interface DownloadStageDocumentArgs {
  projectId: string | number
  documentType: StageDocumentType
  fileName?: string
}

async function fetchDocumentFile({
  projectId,
  documentType,
  fileName,
}: DownloadStageDocumentArgs): Promise<void> {
  const id = Number(projectId)
  const response = await client<Blob>({
    method: 'GET',
    url: `/api/v1/projects/${id}/documents/${documentType}/file/`,
    responseType: 'blob',
  })
  const blob = response.data
  const name = fileName?.trim() || 'document'
  downloadBlob(new File([blob], name), name)
}

/** Скачивание закрывающего документа через `GET /projects/:id/documents/:type/file/`. */
export function useDownloadStageDocument() {
  const mutation = useMutation({ mutationFn: fetchDocumentFile })

  const download = useCallback(
    (args: DownloadStageDocumentArgs) => mutation.mutateAsync(args),
    [mutation],
  )

  return useMemo(
    () => ({
      download,
      isPending: mutation.isPending,
      isError: mutation.isError,
      error: mutation.error,
      reset: mutation.reset,
    }),
    [download, mutation.isPending, mutation.isError, mutation.error, mutation.reset],
  )
}
