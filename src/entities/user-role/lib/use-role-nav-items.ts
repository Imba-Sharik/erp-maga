import { getNavItemsForRole } from './get-nav-items-for-role'
import { useUserRole } from './use-user-role'

export function useRoleNavItems() {
  const role = useUserRole()
  return getNavItemsForRole(role)
}
