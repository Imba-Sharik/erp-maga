import { Navigate } from 'react-router-dom'

import { useUserRole, type UserRole } from '@/entities/user-role'

/** Стартовый раздел роли. Бухгалтер не имеет доступа к `/projects`. */
export function roleHomePath(role: UserRole): string {
  return role === 'accountant' ? '/requests' : '/projects'
}

/** Редирект с `/` на домашний раздел в зависимости от роли. */
export function RoleHomeRedirect() {
  const role = useUserRole()
  return <Navigate to={roleHomePath(role)} replace />
}
