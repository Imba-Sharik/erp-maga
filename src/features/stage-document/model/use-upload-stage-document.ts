import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import type { StageDocumentType } from '@/entities/stage-document-files'
import type { ResponseConfig } from '@/shared/api/client'
import { useProjectsDocumentFileCreate } from '@/shared/api/generated/hooks/projectsController/useProjectsDocumentFileCreate'
import type { ProjectDetail as BackendProjectDetail } from '@/shared/api/generated/types/ProjectDetail'
import { projectsRetrieveQueryKey } from '@/shared/api/generated/hooks/projectsController/useProjectsRetrieve'

import { invalidateProjectAfterTransition } from '@/shared/api/project-transition/invalidate-project-queries'
import { markDocumentReuploaded } from '@/entities/project-documents/lib/document-reupload-tracker'

import { getDocumentUploadErrorMessage } from '../lib/get-document-upload-error-message'

interface UploadStageDocumentArgs {
  projectId: string | number
  documentType: StageDocumentType
  file: File
}

interface UploadStageDocumentCallbacks {
  onSuccess?: () => void
  onError?: (message: string) => void
}

function unwrapProjectDetail(
  detail: BackendProjectDetail | ResponseConfig<BackendProjectDetail>,
): BackendProjectDetail {
  return 'status' in detail ? detail.data : detail
}

/** Загрузка/замена закрывающего документа на бэке. */
export function useUploadStageDocument() {
  const queryClient = useQueryClient()
  const mutation = useProjectsDocumentFileCreate()

  const upload = useCallback(
    (
      { projectId, documentType, file }: UploadStageDocumentArgs,
      callbacks?: UploadStageDocumentCallbacks,
    ) => {
      const id = Number(projectId)
      mutation.mutate(
        { document_type: documentType, id, data: { file } },
        {
          onSuccess: (detail) => {
            const unwrapped = unwrapProjectDetail(detail)
            queryClient.setQueryData(projectsRetrieveQueryKey(id), unwrapped)

            const docEntry = unwrapped.documents?.find(
              (item) => item.document_type === documentType,
            )
            if (docEntry?.status === 're_requested') {
              markDocumentReuploaded(
                id,
                documentType,
                docEntry.file?.uploaded_at ?? new Date().toISOString(),
              )
            }

            invalidateProjectAfterTransition(queryClient, id)
            callbacks?.onSuccess?.()
          },
          onError: (error) => {
            callbacks?.onError?.(getDocumentUploadErrorMessage(error))
          },
        },
      )
    },
    [mutation, queryClient],
  )

  return useMemo(
    () => ({
      upload,
      isPending: mutation.isPending,
      isError: mutation.isError,
      error: mutation.error,
      reset: mutation.reset,
    }),
    [upload, mutation.isPending, mutation.isError, mutation.error, mutation.reset],
  )
}
