import type { UserRole } from '@/entities/user-role'

export type DevRole = UserRole

export interface DevCredentials {
  email: string
  password: string
}

const RAW: Record<DevRole, DevCredentials> = {
  manager: {
    email: import.meta.env.VITE_DEV_EMAIL_MANAGER ?? '',
    password: import.meta.env.VITE_DEV_PASSWORD_MANAGER ?? '',
  },
  director: {
    email: import.meta.env.VITE_DEV_EMAIL_DIRECTOR ?? '',
    password: import.meta.env.VITE_DEV_PASSWORD_DIRECTOR ?? '',
  },
  accountant: {
    email: import.meta.env.VITE_DEV_EMAIL_ACCOUNTANT ?? '',
    password: import.meta.env.VITE_DEV_PASSWORD_ACCOUNTANT ?? '',
  },
}

/** Возвращает креды для роли, если они заданы в env, иначе `null`. */
export function getDevCredentials(role: DevRole): DevCredentials | null {
  const creds = RAW[role]
  if (!creds.email || !creds.password) return null
  return creds
}

/** Список ролей, для которых заданы валидные dev-креды (для кнопок на `/login`). */
export const DEV_ROLES_WITH_CREDS: DevRole[] = (
  ['manager', 'director', 'accountant'] as const
).filter((r) => getDevCredentials(r) !== null)
