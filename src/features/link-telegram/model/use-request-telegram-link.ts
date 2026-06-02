import { useMutation } from '@tanstack/react-query'
import { useCallback } from 'react'

import { telegramLinkRetrieve } from '@/shared/api/generated/clients/telegramController/telegramLinkRetrieve'

import { getTelegramLinkErrorMessage } from '../lib/get-telegram-link-error-message'

/**
 * Запрашивает одноразовую deep link и открывает бота в новой вкладке.
 * Каждый вызов инвалидирует предыдущую ссылку на сервере.
 */
export function useRequestTelegramLink() {
  const mutation = useMutation({
    mutationFn: () => telegramLinkRetrieve(),
  })

  const requestLink = useCallback(async () => {
    const result = await mutation.mutateAsync()
    window.open(result.link, '_blank', 'noopener,noreferrer')
    return result
  }, [mutation])

  return {
    requestLink,
    isPending: mutation.isPending,
    linkData: mutation.data ?? null,
    isError: mutation.isError,
    errorMessage: mutation.error ? getTelegramLinkErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  }
}
