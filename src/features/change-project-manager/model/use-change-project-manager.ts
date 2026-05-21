import { useCallback } from 'react'

import { assignProjectManagerMock } from '@/entities/manager'

import { buildChangeManagerRequest } from '../lib/build-change-manager-request'

export interface ChangeProjectManagerInput {
  projectId: string
  manager: string
}

interface UseChangeProjectManagerOptions {
  onSuccess?: () => void
}

/**
 * TODO: PATCH /projects/{id}/ с телом из buildChangeManagerRequest.
 */
export function useChangeProjectManager({ onSuccess }: UseChangeProjectManagerOptions = {}) {
  const submit = useCallback(
    (input: ChangeProjectManagerInput) => {
      const _body = buildChangeManagerRequest(input.manager)
      void _body
      assignProjectManagerMock(input.projectId, input.manager)
      onSuccess?.()
    },
    [onSuccess],
  )

  return {
    submit,
    isPending: false,
    isError: false,
    errorMessage: null as string | null,
    reset: () => {},
  }
}
