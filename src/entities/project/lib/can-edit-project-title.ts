import type { UserRole } from '@/entities/user-role'

interface CanEditProjectTitleArgs {
  role: UserRole
  /** Проект открыт только для просмотра (см. resolveProjectReadOnly). */
  readOnly: boolean
}

/**
 * Кто может редактировать название проекта вручную (ERP-231).
 *
 * Руководитель/админ — всегда (они открывают любой проект, в т.ч. в режиме просмотра).
 * Ответственный менеджер — когда проект ему доступен на редактирование (`!readOnly`).
 * Прочие роли (напр. бухгалтер) и менеджеры на чужом/пуловом проекте — нет.
 */
export function canEditProjectTitle({ role, readOnly }: CanEditProjectTitleArgs): boolean {
  if (role === 'director' || role === 'admin') return true
  return !readOnly
}
