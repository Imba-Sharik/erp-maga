import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import type { ResponseConfig } from '@/shared/api/client'
import { useProjectsCalculationFileCreate } from '@/shared/api/generated/hooks/projectsController/useProjectsCalculationFileCreate'
import type { ProjectDetail as BackendProjectDetail } from '@/shared/api/generated/types/ProjectDetail'
import { projectsRetrieveQueryKey } from '@/shared/api/generated/hooks/projectsController/useProjectsRetrieve'

import { invalidateProjectAfterTransition } from '@/shared/api/project-transition/invalidate-project-queries'

import { getDocumentUploadErrorMessage } from '../lib/get-document-upload-error-message'

interface UploadCalculationFileArgs {
  projectId: string | number
  file: File
}

interface UploadCalculationFileCallbacks {
  /** Имя файла с бэка (`calculation_file_name`) после успешной загрузки. */
  onSuccess?: (fileName: string) => void
  onError?: (message: string) => void
}

function unwrapProjectDetail(
  detail: BackendProjectDetail | ResponseConfig<BackendProjectDetail>,
): BackendProjectDetail {
  return 'status' in detail ? detail.data : detail
}

/** Загрузка/замена файла сметы на этапе `calculation_prepared` (POST /projects/:id/calculation/file/). */
export function useUploadCalculationFile() {
  const queryClient = useQueryClient()
  const mutation = useProjectsCalculationFileCreate()

  const upload = useCallback(
    ({ projectId, file }: UploadCalculationFileArgs, callbacks?: UploadCalculationFileCallbacks) => {
      const id = Number(projectId)
      mutation.mutate(
        { id, data: { file } },
        {
          onSuccess: (detail) => {
            const unwrapped = unwrapProjectDetail(detail)
            // Свежий `calculation_file_name`/`calculation_file` сразу в кэш detail-запроса.
            queryClient.setQueryData(projectsRetrieveQueryKey(id), unwrapped)
            invalidateProjectAfterTransition(queryClient, id)
            callbacks?.onSuccess?.(unwrapped.calculation_file_name ?? file.name)
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
