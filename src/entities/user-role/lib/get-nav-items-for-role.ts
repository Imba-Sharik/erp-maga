import { ROLE_NAV_ITEMS, type RoleNavIcon, type RoleNavItemId } from '../model/role-navigation'
import type { UserRole } from '../model/types'

export type RoleNavItem = {
  id: RoleNavItemId
  url: string
  icon: RoleNavIcon
  title: string
}

export function getNavItemsForRole(role: UserRole): RoleNavItem[] {
  return ROLE_NAV_ITEMS.filter((item) => item.roles === undefined || item.roles.includes(role)).map(
    (item) => ({
      id: item.id,
      url: item.url,
      icon: item.icon,
      title: item.titleByRole?.[role] ?? item.title,
    }),
  )
}
