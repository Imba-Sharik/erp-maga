import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { setSessionTokens } from '@/entities/session'
import { useAuthTokenCreate } from '@/shared/api/generated/hooks/authController/useAuthTokenCreate'

export interface LoginInput {
  email: string
  password: string
}

/** Ответ `/api/v1/auth/token/` — SimpleJWT-пара (в OpenAPI не описан, тип `any`). */
interface TokenPairResponse {
  access: string
  refresh: string
}

/**
 * Логин: POST /auth/token/ → сохраняем JWT-пару → редирект в приложение.
 * Кэш сбрасываем — данные могли грузиться под dev-токеном или анонимно.
 */
export function useLogin() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const mutation = useAuthTokenCreate({
    mutation: {
      onSuccess: (data) => {
        const { access, refresh } = data as TokenPairResponse
        setSessionTokens({ access, refresh })
        void queryClient.invalidateQueries()
        navigate('/', { replace: true })
      },
    },
  })

  const login = (input: LoginInput) => mutation.mutate({ data: input })

  return {
    login,
    isPending: mutation.isPending,
    isError: mutation.isError,
  }
}
