import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

import { invalidateManagersDirectory } from '@/entities/manager'
import { useProjectsPartialUpdate } from '@/shared/api/generated/hooks/projectsController/useProjectsPartialUpdate'
import { invalidateProjectAfterTransition, invalidateProjectsListQueries } from '@/shared/api'

import { buildChangeManagerRequest } from '../lib/build-change-manager-request'
import { getChangeManagerErrorMessage } from '../lib/get-change-manager-error-message'

export interface ChangeProjectManagerInput {
  projectId: string
  managerId: string
}

interface UseChangeProjectManagerOptions {
  onSuccess?: () => void
}

export function useChangeProjectManager({ onSuccess }: UseChangeProjectManagerOptions = {}) {
  const queryClient = useQueryClient()

  const mutation = useProjectsPartialUpdate({
    mutation: {
      onSuccess: (_data, variables) => {
        invalidateProjectsListQueries(queryClient)
        invalidateProjectAfterTransition(queryClient, variables.id)
        invalidateManagersDirectory(queryClient)
        queryClient.invalidateQueries({ queryKey: ['projects-table'] })
        queryClient.invalidateQueries({ queryKey: ['projects-closing-active-table'] })
        onSuccess?.()
      },
    },
  })

  const submit = useCallback(
    (input: ChangeProjectManagerInput) => {
      const projectId = Number(input.projectId)
      if (!Number.isFinite(projectId)) return

      // Невалидный id (в т.ч. синтетический `name:`) — buildChangeManagerRequest бросит.
      let data: ReturnType<typeof buildChangeManagerRequest>
      try {
        data = buildChangeManagerRequest(input.managerId)
      } catch {
        return
      }

      mutation.mutate({ id: projectId, data })
    },
    [mutation],
  )

  const errorMessage = mutation.isError ? getChangeManagerErrorMessage(mutation.error) : null

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
