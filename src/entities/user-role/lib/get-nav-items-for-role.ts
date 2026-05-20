import { APP_NAV_ITEMS, type AppNavIcon, type AppNavItemId } from '../model/app-navigation'
import type { UserRole } from '../model/types'

export type AppNavItem = {
  id: AppNavItemId
  url: string
  icon: AppNavIcon
  title: string
}

export function getNavItemsForRole(role: UserRole): AppNavItem[] {
  return APP_NAV_ITEMS.filter((item) => item.roles === undefined || item.roles.includes(role)).map(
    (item) => ({
      id: item.id,
      url: item.url,
      icon: item.icon,
      title: item.titleByRole?.[role] ?? item.title,
    }),
  )
}
