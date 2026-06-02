import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import { useTelegramLinkDestroy } from '@/shared/api/generated/hooks/telegramController/useTelegramLinkDestroy'
import { usersMeRetrieveQueryKey } from '@/shared/api/generated/hooks/usersController/useUsersMeRetrieve'

import { getTelegramLinkErrorMessage } from '../lib/get-telegram-link-error-message'

interface UseUnlinkTelegramOptions {
  onSuccess?: () => void
}

export function useUnlinkTelegram({ onSuccess }: UseUnlinkTelegramOptions = {}) {
  const queryClient = useQueryClient()

  const mutation = useTelegramLinkDestroy({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: usersMeRetrieveQueryKey() })
        onSuccess?.()
      },
    },
  })

  const unlink = useCallback(() => {
    mutation.mutate()
  }, [mutation])

  return {
    unlink,
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorMessage: mutation.error ? getTelegramLinkErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  }
}
