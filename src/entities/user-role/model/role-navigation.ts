import type { ComponentType, SVGProps } from 'react'

import {
  BellIcon,
  CalendarIcon,
  DashboardIcon,
  FolderIcon,
  ListChecksIcon,
  ManagersControlIcon,
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
  | 'managers'
  | 'requests'
  | 'closed-requests'
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
  {
    id: 'calendar',
    title: 'Календарь',
    url: '/calendar',
    icon: CalendarIcon,
    roles: ['manager', 'director'],
  },
  {
    id: 'projects',
    title: 'Проекты',
    url: '/projects',
    icon: FolderIcon,
    roles: ['manager', 'director'],
    titleByRole: { director: 'Все проекты' },
  },
  {
    id: 'closing',
    title: 'Закрытие',
    url: '/closing',
    icon: ListChecksIcon,
    roles: ['manager', 'director'],
  },
  {
    id: 'outside-mag',
    title: 'Вне контура MAG',
    url: '/outside-mag',
    icon: OutOfScopeIcon,
    roles: ['director'],
  },
  {
    id: 'managers',
    title: 'Менеджеры',
    url: '/managers',
    icon: ManagersControlIcon,
    roles: ['director'],
  },
  {
    id: 'requests',
    title: 'Запросы',
    url: '/requests',
    icon: ListChecksIcon,
    roles: ['accountant'],
  },
  {
    id: 'closed-requests',
    title: 'Закрытые запросы',
    url: '/closed-requests',
    icon: FolderIcon,
    roles: ['accountant'],
  },
  { id: 'notifications', title: 'Уведомления', url: '/notifications', icon: BellIcon },
  { id: 'settings', title: 'Настройки', url: '/settings', icon: SettingsIcon },
]
