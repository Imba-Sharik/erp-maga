import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import type { DocumentStatus } from '@/entities/project'
import type { StageDocumentType } from '@/entities/stage-document-file'
import { useProjectsDocumentsPartialUpdate } from '@/shared/api/generated/hooks/projectsController/useProjectsDocumentsPartialUpdate'
import { projectsRetrieveQueryKey } from '@/shared/api/generated/hooks/projectsController/useProjectsRetrieve'

interface UpdateDocumentStatusArgs {
  projectId: string | number
  documentType: StageDocumentType
  status: DocumentStatus
}

/**
 * Инкрементальное обновление статуса закрывающего документа без перехода этапа.
 *
 * Запрос «повторно» / подтверждение «есть» / «не требуется» — это действия
 * бухгалтера внутри этапа `documents_confirmed`. После успеха инвалидируем
 * кэш проекта, чтобы из `GET /projects/:id/` подтянулись свежие
 * `*_confirmed_at` / `*_confirmed_by`.
 */
export function useUpdateDocumentStatus() {
  const queryClient = useQueryClient()
  const mutation = useProjectsDocumentsPartialUpdate()

  const update = useCallback(
    ({ projectId, documentType, status }: UpdateDocumentStatusArgs) => {
      const id = Number(projectId)
      mutation.mutate(
        {
          id,
          data: { documents: [{ document_type: documentType, status }] },
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectsRetrieveQueryKey(id) })
          },
        },
      )
    },
    [mutation, queryClient],
  )

  return useMemo(
    () => ({
      update,
      isPending: mutation.isPending,
      isError: mutation.isError,
      error: mutation.error,
      reset: mutation.reset,
    }),
    [update, mutation.isPending, mutation.isError, mutation.error, mutation.reset],
  )
}
