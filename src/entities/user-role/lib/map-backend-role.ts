import type { UserMeSchemaRoleEnumKey } from '@/shared/api/generated/types/UserMeSchema'

import type { UserRole } from '../model/types'

export function mapBackendRole(role: UserMeSchemaRoleEnumKey | undefined): UserRole | undefined {
  if (!role) return undefined
  if (role === 'admin') return 'director'
  return role
}
