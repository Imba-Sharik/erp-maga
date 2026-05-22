import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import type { ProjectTransitionRequest } from '@/shared/api/generated/types/ProjectTransitionRequest'
import { useProjectsTransitionsCreate } from '@/shared/api/generated/hooks/projectsController/useProjectsTransitionsCreate'
import type { ProjectDetailSchema } from '@/shared/api/generated/types/ProjectDetailSchema'
import { projectsRetrieveQueryKey } from '@/shared/api/generated/hooks/projectsController/useProjectsRetrieve'

import { getTransitionErrorMessage } from './get-transition-error-message'
import { invalidateProjectAfterTransition } from './invalidate-project-queries'

interface UseProjectTransitionOptions {
  fallbackErrorMessage?: string
}

export function useProjectTransition({
  fallbackErrorMessage = 'Не удалось выполнить переход',
}: UseProjectTransitionOptions = {}) {
  const queryClient = useQueryClient()
  const mutation = useProjectsTransitionsCreate()

  const submit = useCallback(
    (
      projectId: number,
      data: ProjectTransitionRequest,
      options?: {
        onSuccess?: (detail: ProjectDetailSchema) => void
        onError?: () => void
      },
    ) => {
      mutation.mutate(
        { id: projectId, data },
        {
          onSuccess: (detail) => {
            queryClient.setQueryData(projectsRetrieveQueryKey(projectId), detail)
            invalidateProjectAfterTransition(queryClient, projectId)
            options?.onSuccess?.(detail)
          },
          onError: () => {
            options?.onError?.()
          },
        },
      )
    },
    [mutation, queryClient],
  )

  const errorMessage = mutation.isError
    ? getTransitionErrorMessage(mutation.error, fallbackErrorMessage)
    : null

  return useMemo(
    () => ({
      submit,
      isPending: mutation.isPending,
      isError: mutation.isError,
      errorMessage,
      reset: mutation.reset,
    }),
    [submit, mutation.isPending, mutation.isError, mutation.reset, errorMessage],
  )
}
