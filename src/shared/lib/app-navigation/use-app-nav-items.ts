import { useUserRole } from '@/entities/user-role'

import { getNavItemsForRole } from './get-nav-items-for-role'

export function useAppNavItems() {
  const role = useUserRole()
  return getNavItemsForRole(role)
}
