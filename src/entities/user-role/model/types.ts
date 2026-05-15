export type UserRole = 'manager' | 'accountant' | 'director'

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  manager: 'Менеджер',
  accountant: 'Бухгалтер',
  director: 'Руководитель',
}

export const USER_ROLES: UserRole[] = ['manager', 'accountant', 'director']
