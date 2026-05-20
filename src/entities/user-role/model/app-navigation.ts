import type { ComponentType, SVGProps } from 'react'

import {
  BellIcon,
  CalendarIcon,
  DashboardIcon,
  FolderIcon,
  ListChecksIcon,
  SettingsIcon,
} from '@/shared/assets'

import type { UserRole } from './types'

export type AppNavItemId =
  | 'dashboard'
  | 'calendar'
  | 'projects'
  | 'closing'
  | 'outside-mag'
  | 'notifications'
  | 'settings'

export type AppNavIcon = ComponentType<SVGProps<SVGSVGElement>>

export type AppNavItemDef = {
  id: AppNavItemId
  url: string
  icon: AppNavIcon
  title: string
  /** Если не задано — пункт виден всем ролям */
  roles?: readonly UserRole[]
  /** Подпись для конкретных ролей при том же url */
  titleByRole?: Partial<Record<UserRole, string>>
}

export const APP_NAV_ITEMS: readonly AppNavItemDef[] = [
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
    icon: FolderIcon,
    roles: ['director'],
  },
  { id: 'notifications', title: 'Уведомления', url: '/notifications', icon: BellIcon },
  { id: 'settings', title: 'Настройки', url: '/settings', icon: SettingsIcon },
]
