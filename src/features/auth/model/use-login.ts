import { useLocation, useNavigate } from 'react-router-dom'

import { useAuthTokenMutation } from './use-auth-token-mutation'

export interface LoginInput {
  email: string
  password: string
}

/**
 * Логин из формы `/login`. После успеха редиректит на `state.from ?? '/'`.
 */
export function useLogin() {
  const navigate = useNavigate()
  const location = useLocation()

  const mutation = useAuthTokenMutation({
    onSuccess: () => {
      const from = (location.state as { from?: string } | null)?.from
      navigate(from ?? '/', { replace: true })
    },
  })

  const login = (input: LoginInput) => mutation.mutate({ data: input })

  return {
    login,
    isPending: mutation.isPending,
    isError: mutation.isError,
  }
}
