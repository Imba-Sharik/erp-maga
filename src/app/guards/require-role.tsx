import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { useUserRole, type UserRole } from '@/entities/user-role'

type RequireRoleProps = {
  roles: readonly UserRole[]
  children: ReactNode
}

export function RequireRole({ roles, children }: RequireRoleProps) {
  const role = useUserRole()
  if (!roles.includes(role)) {
    return <Navigate to="/projects" replace />
  }
  return children
}
