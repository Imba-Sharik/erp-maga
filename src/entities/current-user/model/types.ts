import type { UserRole } from '@/entities/user-role'

export interface CurrentUser {
  id: string
  /** ФИО для бизнес-контекстов («Статус перевёл менеджер», «Кто подтвердил» и т.д.). */
  fullName: string
  /** Короткое имя «Имя Фамилия» для сайдбара. */
  displayName: string
  initials: string
  email: string
  role: UserRole
}
