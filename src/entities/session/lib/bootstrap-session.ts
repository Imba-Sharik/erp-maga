import { applyDevSessionForRole } from './dev-tokens'
import { readPersistedUserRole } from './read-persisted-role'

/** Синхронно подставляет dev JWT до первого API-запроса. */
export function bootstrapDevSession(): void {
  applyDevSessionForRole(readPersistedUserRole())
}
