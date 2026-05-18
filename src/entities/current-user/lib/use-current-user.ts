import { useUserRole, type UserRole } from '@/entities/user-role'

import type { CurrentUser } from '../model/types'

/**
 * Заглушка до подключения JWT/`/users/me`. Возвращает пользователя на основе текущей выбранной роли.
 * Когда появится бэк — заменить тело на `useUsersMeRetrieve` (см. shared/api/generated/hooks).
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

export function useCurrentUser(): CurrentUser {
  const role = useUserRole()
  return {
    id: `stub-${role}`,
    role,
    ...STUB_USERS[role],
  }
}
