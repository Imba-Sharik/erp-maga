import { mapBackendRole, useUserRole, useUserRoleStore, type UserRole } from '@/entities/user-role'
import { useUsersMeRetrieve } from '@/shared/api/generated/hooks/usersController/useUsersMeRetrieve'

import type { CurrentUser } from '../model/types'

/**
 * Заглушки на случай, если `/users/me/` ещё не успел вернуть данные
 * (между mount и первым ответом). Не используются после успешной загрузки.
 */
const STUB_USERS: Record<UserRole, Omit<CurrentUser, 'role' | 'id'>> = {
  manager: {
    fullName: 'Шарин Игорь Дмитриевич',
    displayName: 'Игорь Шарин',
    initials: 'ИШ',
    email: 'sharinigor1@gmail.com',
  },
  accountant: {
    fullName: 'Петрова Анна Сергеевна',
    displayName: 'Анна Петрова',
    initials: 'АП',
    email: 'a.petrova@mag.example',
  },
  director: {
    fullName: 'Сидоров Сергей Сергеевич',
    displayName: 'Сергей Сидоров',
    initials: 'СС',
    email: 's.sidorov@mag.example',
  },
}

function firstChar(value: string): string {
  return value.trim().charAt(0).toUpperCase()
}

/** Текущий пользователь: данные из `/users/me/`, fallback на дев-стаб по выбранной роли. */
export function useCurrentUser(): CurrentUser {
  const { data } = useUsersMeRetrieve({
    query: { staleTime: Infinity, retry: false },
  })
  const role = useUserRole()
  const persistedRole = useUserRoleStore((s) => s.role)

  if (!data) {
    return {
      id: `stub-${persistedRole}`,
      role,
      ...STUB_USERS[persistedRole],
    }
  }

  const firstName = data.first_name?.trim() ?? ''
  const lastName = data.last_name?.trim() ?? ''
  const username = data.username?.trim() ?? ''
  const hasName = firstName || lastName
  const displayName = hasName ? `${firstName} ${lastName}`.trim() : username || data.email
  const fullName = hasName ? `${lastName} ${firstName}`.trim() : displayName
  const initials = hasName
    ? `${firstChar(firstName)}${firstChar(lastName)}`.trim() || firstChar(displayName)
    : firstChar(displayName)

  return {
    id: String(data.id),
    role,
    fullName,
    displayName,
    initials: initials || '·',
    email: data.email,
  }
}
