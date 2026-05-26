import { useQueryClient } from '@tanstack/react-query'

import { setSessionTokens } from '@/entities/session'
import { useAuthTokenCreate } from '@/shared/api/generated/hooks/authController/useAuthTokenCreate'

import type { TokenPair } from '../lib/types'

interface Options {
  /** Дополнительные действия после сохранения токенов и очистки кэша (например, навигация). */
  onSuccess?: () => void
}

/**
 * Общая обвязка вокруг `POST /auth/token/`:
 *   1) сохраняем JWT-пару в localStorage,
 *   2) `queryClient.clear()` — не invalidate! — иначе старый `/users/me/` остаётся
 *      в кэше и `RequireAuth` отрендерит дерево со старой ролью на один кадр.
 *   3) колбэк вызывающего (редирект и т.д.).
 */
export function useAuthTokenMutation({ onSuccess }: Options = {}) {
  const queryClient = useQueryClient()

  return useAuthTokenCreate({
    mutation: {
      onSuccess: (data) => {
        const { access, refresh } = data as TokenPair
        setSessionTokens({ access, refresh })
        queryClient.clear()
        onSuccess?.()
      },
    },
  })
}
