import type { Meeting } from '@/entities/meeting'
import type { UserRole } from '@/entities/user-role'

/** Создавать встречи могут менеджер и руководитель. */
export function canCreateMeeting(role: UserRole): boolean {
  return role === 'manager' || role === 'director'
}

export interface CanModifyMeetingArgs {
  role: UserRole
  /** id текущего пользователя (владельца), null — пока не загружен `/users/me/`. */
  ownerId: number | null
  meeting: Meeting
}

/**
 * Редактировать/удалять встречу можно только свою.
 * Менеджер видит лишь свои встречи (серверный скоуп) — для него всегда true.
 * Руководитель видит свои + менеджерские, поэтому правит только встречи, где владелец — он сам.
 */
export function canModifyMeeting({ role, ownerId, meeting }: CanModifyMeetingArgs): boolean {
  if (role === 'manager') return true
  if (role === 'director') return ownerId != null && meeting.managerId === ownerId
  return false
}
