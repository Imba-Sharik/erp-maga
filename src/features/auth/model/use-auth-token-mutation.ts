import { useQueryClient } from '@tanstack/react-query'

import { setAccessToken } from '@/entities/session'
import { useAuthTokenCreate } from '@/shared/api/generated/hooks/authController/useAuthTokenCreate'

interface Options {
  /** Дополнительные действия после сохранения токенов и очистки кэша (например, навигация). */
  onSuccess?: () => void
}

/**
 * Общая обвязка вокруг `POST /auth/token/`:
 *   1) сохраняем access в localStorage (refresh — HttpOnly cookie),
 *   2) `queryClient.clear()` — не invalidate! — иначе старый `/users/me/` остаётся
 *      в кэше и `RequireAuth` отрендерит дерево со старой ролью на один кадр.
 *   3) колбэк вызывающего (редирект и т.д.).
 */
export function useAuthTokenMutation({ onSuccess }: Options = {}) {
  const queryClient = useQueryClient()

  return useAuthTokenCreate({
    mutation: {
      onSuccess: (data) => {
        setAccessToken(data.access)
        queryClient.clear()
        onSuccess?.()
      },
    },
  })
}
