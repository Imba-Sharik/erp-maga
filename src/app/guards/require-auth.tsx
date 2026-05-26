import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { ACCESS_TOKEN_KEY, clearSessionTokens } from '@/entities/session'
import { useUsersMeRetrieve } from '@/shared/api/generated/hooks/usersController/useUsersMeRetrieve'

import type { ReactNode } from 'react'

interface RequireAuthProps {
  children: ReactNode
}

function hasAccessToken(): boolean {
  return Boolean(localStorage.getItem(ACCESS_TOKEN_KEY))
}

function isUnauthorized(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const status = (error as { status?: number; response?: { status?: number } }).status
  const respStatus = (error as { response?: { status?: number } }).response?.status
  return status === 401 || respStatus === 401
}

/**
 * Гард: пускает в защищённую зону только при валидной сессии.
 * - Нет access-токена → редирект на `/login` (с `state.from`).
 * - `/users/me/` отдал 401 → чистим токены, редирект на `/login`.
 * - Пока первый ответ не пришёл → splash-заглушка.
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation()
  const queryClient = useQueryClient()
  const tokenPresent = hasAccessToken()

  const { data, isLoading, isError, error } = useUsersMeRetrieve({
    query: {
      enabled: tokenPresent,
      staleTime: Infinity,
      retry: false,
    },
  })

  const unauthorized = isError && isUnauthorized(error)

  useEffect(() => {
    if (unauthorized) {
      clearSessionTokens()
      queryClient.clear()
    }
  }, [unauthorized, queryClient])

  if (!tokenPresent || unauthorized) {
    const from = location.pathname + location.search + location.hash
    return <Navigate to="/login" replace state={{ from }} />
  }

  if (isLoading || !data) {
    return (
      <div
        role="status"
        aria-label="Загрузка"
        className="flex h-svh w-full items-center justify-center bg-background"
      />
    )
  }

  return <>{children}</>
}
