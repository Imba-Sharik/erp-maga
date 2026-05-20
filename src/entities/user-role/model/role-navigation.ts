import type { ComponentType, SVGProps } from 'react'

import {
  BellIcon,
  CalendarIcon,
  DashboardIcon,
  FolderIcon,
  ListChecksIcon,
  SettingsIcon,
  OutOfScopeIcon,
} from '@/shared/assets'

import type { UserRole } from './types'

export type RoleNavItemId =
  | 'dashboard'
  | 'calendar'
  | 'projects'
  | 'closing'
  | 'outside-mag'
  | 'notifications'
  | 'settings'

export type RoleNavIcon = ComponentType<SVGProps<SVGSVGElement>>

export type RoleNavItemDef = {
  id: RoleNavItemId
  url: string
  icon: RoleNavIcon
  title: string
  /** Если не задано — пункт виден всем ролям */
  roles?: readonly UserRole[]
  /** Подпись для конкретных ролей при том же url */
  titleByRole?: Partial<Record<UserRole, string>>
}

export const ROLE_NAV_ITEMS: readonly RoleNavItemDef[] = [
  { id: 'dashboard', title: 'Дашборд', url: '/dashboard', icon: DashboardIcon },
  { id: 'calendar', title: 'Календарь', url: '/calendar', icon: CalendarIcon },
  {
    id: 'projects',
    title: 'Проекты',
    url: '/projects',
    icon: FolderIcon,
    titleByRole: { director: 'Все проекты' },
  },
  { id: 'closing', title: 'Закрытие', url: '/closing', icon: ListChecksIcon },
  {
    id: 'outside-mag',
    title: 'Вне контура MAG',
    url: '/outside-mag',
    icon: OutOfScopeIcon,
    roles: ['director'],
  },
  { id: 'notifications', title: 'Уведомления', url: '/notifications', icon: BellIcon },
  { id: 'settings', title: 'Настройки', url: '/settings', icon: SettingsIcon },
]
