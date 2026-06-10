import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { clearSessionTokens, getAccessToken } from '@/entities/session'
import { useUsersMeRetrieve } from '@/shared/api/generated/hooks/usersController/useUsersMeRetrieve'
import { refreshAccessToken } from '@/shared/api/client'

import type { ReactNode } from 'react'

interface RequireAuthProps {
  children: ReactNode
}

type BootstrapState = 'idle' | 'pending' | 'failed'

function isUnauthorized(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const status = (error as { status?: number; response?: { status?: number } }).status
  const respStatus = (error as { response?: { status?: number } }).response?.status
  return status === 401 || respStatus === 401
}

function AuthSplash() {
  return (
    <div
      role="status"
      aria-label="Загрузка"
      className="flex h-svh w-full items-center justify-center bg-background"
    />
  )
}

/**
 * Гард: пускает в защищённую зону только при валидной сессии.
 * - Нет access-токена → silent refresh по HttpOnly cookie.
 * - `/users/me/` отдал 401 после провала refresh (interceptor) → редирект на `/login`.
 * - Пока bootstrap или первый `/users/me/` — splash-заглушка.
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const location = useLocation()
  const queryClient = useQueryClient()
  const [tokenPresent, setTokenPresent] = useState(() => Boolean(getAccessToken()))
  const [bootstrapState, setBootstrapState] = useState<BootstrapState>(() =>
    getAccessToken() ? 'idle' : 'pending',
  )

  useEffect(() => {
    if (tokenPresent || bootstrapState !== 'pending') return

    let cancelled = false
    void refreshAccessToken()
      .then(() => {
        if (cancelled) return
        setTokenPresent(true)
        setBootstrapState('idle')
      })
      .catch(() => {
        if (cancelled) return
        setBootstrapState('failed')
      })

    return () => {
      cancelled = true
    }
  }, [tokenPresent, bootstrapState])

  const { data, isLoading, isError, error } = useUsersMeRetrieve({
    query: {
      enabled: tokenPresent,
      staleTime: Infinity,
      retry: false,
    },
  })

  const unauthorized = isError && isUnauthorized(error)

  useEffect(() => {
    if (!unauthorized) return
    clearSessionTokens()
    queryClient.clear()
  }, [unauthorized, queryClient])

  if (bootstrapState === 'pending') {
    return <AuthSplash />
  }

  if (!tokenPresent || bootstrapState === 'failed' || unauthorized) {
    const from = location.pathname + location.search + location.hash
    return <Navigate to="/login" replace state={{ from }} />
  }

  if (isLoading || !data) {
    return <AuthSplash />
  }

  return <>{children}</>
}
