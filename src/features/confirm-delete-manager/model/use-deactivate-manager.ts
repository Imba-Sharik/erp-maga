import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import { invalidateManagersDirectory } from '@/entities/manager'
import { useUsersPartialUpdate } from '@/shared/api/generated/hooks/usersController/useUsersPartialUpdate'

interface UseDeactivateManagerOptions {
  onSuccess?: () => void
}

export function useDeactivateManager({ onSuccess }: UseDeactivateManagerOptions = {}) {
  const queryClient = useQueryClient()

  const mutation = useUsersPartialUpdate({
    mutation: {
      onSuccess: () => {
        invalidateManagersDirectory(queryClient)
        onSuccess?.()
      },
    },
  })

  const deactivate = useCallback(
    (managerId: string) => {
      const id = Number(managerId)
      if (!Number.isFinite(id)) return

      mutation.mutate({
        id,
        data: { is_active: false },
      })
    },
    [mutation],
  )

  return {
    deactivate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  }
}
