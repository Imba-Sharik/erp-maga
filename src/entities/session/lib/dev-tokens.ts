import type { UserRole } from '@/entities/user-role'

import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../model/keys'

type DevTokens = { access?: string; refresh?: string }

const DEV_TOKENS_BY_ROLE: Record<UserRole, DevTokens> = {
  manager: {
    access: import.meta.env.VITE_DEV_ACCESS_TOKEN_MANAGER || undefined,
    refresh: import.meta.env.VITE_DEV_REFRESH_TOKEN_MANAGER || undefined,
  },
  director: {
    access: import.meta.env.VITE_DEV_ACCESS_TOKEN_DIRECTOR || undefined,
    refresh: import.meta.env.VITE_DEV_REFRESH_TOKEN_DIRECTOR || undefined,
  },
  accountant: {
    access: import.meta.env.VITE_DEV_ACCESS_TOKEN_ACCOUNTANT || undefined,
    refresh: import.meta.env.VITE_DEV_REFRESH_TOKEN_ACCOUNTANT || undefined,
  },
}

export function applyDevSessionForRole(role: UserRole): void {
  const { access, refresh } = DEV_TOKENS_BY_ROLE[role]

  if (access) {
    localStorage.setItem(ACCESS_TOKEN_KEY, access)
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    if (import.meta.env.DEV) {
      console.warn(
        `[session] VITE_DEV_ACCESS_TOKEN_${role.toUpperCase()} не задан — запросы к API без Authorization`,
      )
    }
  }

  if (refresh) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }
}
