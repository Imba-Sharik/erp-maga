import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { UserRole } from './types'

interface UserRoleState {
  role: UserRole
  setRole: (role: UserRole) => void
}

export const useUserRoleStore = create<UserRoleState>()(
  persist(
    (set) => ({
      role: 'manager',
      setRole: (role) => set({ role }),
    }),
    { name: 'erp-maga:user-role' },
  ),
)

export const useUserRole = () => useUserRoleStore((s) => s.role)
