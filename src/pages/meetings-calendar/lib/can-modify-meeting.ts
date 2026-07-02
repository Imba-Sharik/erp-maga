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
 * Редактировать/удалять встречу можно только свою — и менеджеру, и руководителю
 * (бэк enforce-ит owner-only для всех ролей: правка чужой встречи → 403/404).
 * После ERP-216 менеджер через фильтр «Отв. менеджер» видит и чужие встречи,
 * поэтому владельца сверяем и у него — иначе на чужих встречах показались бы
 * кнопки правки/удаления, которые всё равно упрутся в отказ бэка.
 */
export function canModifyMeeting({ role, ownerId, meeting }: CanModifyMeetingArgs): boolean {
  if (role !== 'manager' && role !== 'director') return false
  return ownerId != null && meeting.managerId === ownerId
}
