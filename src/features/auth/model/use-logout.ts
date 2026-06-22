import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { clearSessionTokens } from '@/shared/lib/auth-session'
import { authLogoutCreate } from '@/shared/api/generated/clients/authController/authLogoutCreate'

/**
 * Серверный logout (blacklist refresh + очистка cookie) и локальная очистка сессии.
 * API-вызов best-effort: localStorage чистим даже при ошибке сети.
 */
export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const logout = useCallback(async () => {
    try {
      await authLogoutCreate()
    } catch {
      // cookie/local session всё равно сбрасываем ниже
    }
    clearSessionTokens()
    queryClient.clear()
    setTimeout(() => navigate('/login', { replace: true }), 0)
  }, [navigate, queryClient])

  return { logout }
}
