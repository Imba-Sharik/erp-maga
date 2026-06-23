import type { Reminder } from '@/entities/reminder'
import type { UserRole } from '@/entities/user-role'

/** Создавать напоминания могут менеджер и руководитель (ERP-187). */
export function canCreateReminder(role: UserRole): boolean {
  return role === 'manager' || role === 'director'
}

export interface CanModifyReminderArgs {
  role: UserRole
  /** id текущего пользователя (владельца), null — пока не загружен `/users/me/`. */
  ownerId: number | null
  reminder: Reminder
}

/**
 * Редактировать/удалять можно только своё напоминание.
 * Менеджер видит лишь свои напоминания (серверный скоуп) — для него всегда true.
 * Руководитель видит свои + менеджерские, поэтому правит только те, где владелец — он сам.
 */
export function canModifyReminder({ role, ownerId, reminder }: CanModifyReminderArgs): boolean {
  if (role === 'manager') return true
  if (role === 'director') return ownerId != null && reminder.managerId === ownerId
  return false
}
