import { applyDevSessionForRole } from '@/entities/session'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { USER_ROLE_STORAGE_KEY } from './constants'
import type { UserRole } from './types'

interface UserRoleState {
  role: UserRole
  setRole: (role: UserRole) => void
}

export const useUserRoleStore = create<UserRoleState>()(
  persist(
    (set) => ({
      role: 'manager',
      setRole: (role) => {
        set({ role })
        applyDevSessionForRole(role)
      },
    }),
    {
      name: USER_ROLE_STORAGE_KEY,
      onRehydrateStorage: () => (state) => {
        if (state) applyDevSessionForRole(state.role)
      },
    },
  ),
)

export const useUserRole = () => useUserRoleStore((s) => s.role)
