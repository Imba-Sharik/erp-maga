import { USER_ROLE_STORAGE_KEY } from '@/entities/user-role/model/constants'
import type { UserRole } from '@/entities/user-role/model/types'

const ROLES: UserRole[] = ['manager', 'accountant', 'director']

function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && (ROLES as string[]).includes(value)
}

/** Читает роль из zustand persist до гидрации стора (для синхронного bootstrap). */
export function readPersistedUserRole(fallback: UserRole = 'manager'): UserRole {
  try {
    const raw = localStorage.getItem(USER_ROLE_STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as { state?: { role?: unknown } }
    const role = parsed.state?.role
    return isUserRole(role) ? role : fallback
  } catch {
    return fallback
  }
}
