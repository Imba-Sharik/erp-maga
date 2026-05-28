export type UserRole = 'manager' | 'accountant' | 'director' | 'admin'

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  manager: 'Менеджер',
  accountant: 'Бухгалтер',
  director: 'Руководитель',
  admin: 'Администратор',
}

export const USER_ROLES: UserRole[] = ['manager', 'accountant', 'director', 'admin']
