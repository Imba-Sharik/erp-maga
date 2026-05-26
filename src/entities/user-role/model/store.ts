import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { USER_ROLE_STORAGE_KEY } from './constants'
import type { UserRole } from './types'

interface UserRoleState {
  role: UserRole
  setRole: (role: UserRole) => void
}

/**
 * Хранит последнюю выбранную роль для UX-нужд (например, чтобы радиогруппа в dev-меню
 * стартовала с осмысленного значения до загрузки `/users/me/`).
 * Источник правды о роли — `/users/me/`, а не этот стор.
 */
export const useUserRoleStore = create<UserRoleState>()(
  persist(
    (set) => ({
      role: 'manager',
      setRole: (role) => set({ role }),
    }),
    { name: USER_ROLE_STORAGE_KEY },
  ),
)
