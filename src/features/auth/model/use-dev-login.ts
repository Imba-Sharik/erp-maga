import { getDevCredentials, type DevRole } from '../lib/dev-credentials'
import { useAuthTokenMutation } from './use-auth-token-mutation'

/**
 * Реальный логин по dev-кредам из env — без редиректа.
 * Используется dev-свитчером в сайдбаре, чтобы остаться на текущей странице
 * (если новая роль её не видит — отработает `RequireRole`).
 */
export function useDevLogin() {
  const mutation = useAuthTokenMutation()

  const loginAs = (role: DevRole): void => {
    const creds = getDevCredentials(role)
    if (!creds) return
    mutation.mutate({ data: creds })
  }

  return { loginAs, isPending: mutation.isPending, isError: mutation.isError }
}
