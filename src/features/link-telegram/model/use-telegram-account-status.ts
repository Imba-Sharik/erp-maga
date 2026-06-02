import { useEffect } from 'react'

import { useUsersMeRetrieve } from '@/shared/api/generated/hooks/usersController/useUsersMeRetrieve'

import { formatTelegramUsername } from '../lib/format-telegram-username'

/** Статус привязки Telegram из `/users/me/`; при возврате на вкладку данные обновляются. */
export function useTelegramAccountStatus() {
  const { data, isLoading, isFetching, refetch } = useUsersMeRetrieve({
    query: { staleTime: 30_000 },
  })

  useEffect(() => {
    const refresh = () => {
      void refetch()
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refresh()
    }

    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [refetch])

  return {
    isLoading,
    isFetching,
    isLinked: data?.telegram_linked ?? false,
    username: formatTelegramUsername(data?.telegram_username),
    refetch,
  }
}
