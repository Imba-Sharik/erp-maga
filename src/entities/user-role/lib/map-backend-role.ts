import type { UserMeSchemaRoleEnumKey } from '@/shared/api/generated/types/UserMeSchema'

import type { UserRole } from '../model/types'

export function mapBackendRole(role: UserMeSchemaRoleEnumKey | undefined): UserRole | undefined {
  if (!role) return undefined
  if (role === 'lead') return 'director'
  if (role === 'manager_mag') return 'manager'
  return role as UserRole
}
