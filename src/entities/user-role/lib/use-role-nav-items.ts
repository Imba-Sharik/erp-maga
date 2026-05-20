import { getNavItemsForRole } from './get-nav-items-for-role'
import { useUserRole } from '../model/store'

export function useRoleNavItems() {
  const role = useUserRole()
  return getNavItemsForRole(role)
}
