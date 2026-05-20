import { getNavItemsForRole } from './get-nav-items-for-role'
import { useUserRole } from '../model/store'

export function useAppNavItems() {
  const role = useUserRole()
  return getNavItemsForRole(role)
}
