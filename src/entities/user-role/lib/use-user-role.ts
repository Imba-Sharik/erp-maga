import { useUsersMeRetrieve } from '@/shared/api/generated/hooks/usersController/useUsersMeRetrieve'

import { useUserRoleStore } from '../model/store'
import type { UserRole } from '../model/types'
import { mapBackendRole } from './map-backend-role'

/**
 * Источник правды — `/users/me/`. Пока `me` не загружен, отдаём persisted-роль из zustand
 * (дев-переключалка, корректная стартовая роль до первого ответа бэка).
 *
 * Запрос `useUsersMeRetrieve` запускается и шарится через React Query — не дублируется
 * между потребителями, тот же queryKey, что у `RequireAuth`.
 */
export function useUserRole(): UserRole {
  const { data } = useUsersMeRetrieve({
    query: { staleTime: Infinity, retry: false },
  })
  const fallback = useUserRoleStore((s) => s.role)
  return mapBackendRole(data?.role) ?? fallback
}
