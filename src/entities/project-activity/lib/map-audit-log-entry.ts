import { USER_ROLES, type UserRole } from '@/entities/user-role'
import type { ProjectAuditLog } from '@/shared/api/generated/types/ProjectAuditLog'

import { formatAuditLogAction, type AuditLogFormatContext } from './audit-log'
import type { ProjectActivityEvent } from '../model/types'

function resolveActorName(entry: ProjectAuditLog): string {
  if (entry.user?.full_name) return entry.user.full_name
  if (entry.source === 'plum') return 'PLUM'
  if (entry.source === 'system') return 'Система'
  return ''
}

/**
 * `frontend_role` приходит как UI-роль (manager/director/accountant/admin), но типизирован
 * на бэке как обычная строка — валидируем перед использованием в префиксе «Руководитель …».
 */
function resolveActorRole(entry: ProjectAuditLog): UserRole | undefined {
  const role = entry.user?.frontend_role
  return role && (USER_ROLES as string[]).includes(role) ? (role as UserRole) : undefined
}

/** Запись audit-log с бэка → событие для UI «Лога действий». */
export function mapAuditLogEntry(
  entry: ProjectAuditLog,
  ctx?: AuditLogFormatContext,
): ProjectActivityEvent {
  return {
    id: String(entry.id),
    actorRole: resolveActorRole(entry),
    actorName: resolveActorName(entry),
    action: formatAuditLogAction(entry, ctx),
    at: entry.created_at,
  }
}

export function mapAuditLogEntries(
  entries: ProjectAuditLog[],
  ctx?: AuditLogFormatContext,
): ProjectActivityEvent[] {
  return entries.map((entry) => mapAuditLogEntry(entry, ctx))
}
