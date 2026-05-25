/**
 * Минимальная форма payload с бэка для навигации на проект.
 * На стенде (2026-05): `project_id`, `event_name`, `event_date`, `stage`, `new_stage`, `old_stage`.
 */
export interface NotificationPayloadFields {
  projectId?: number
  projectTitle?: string
}

function readNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value)
    return Number.isFinite(n) ? n : undefined
  }
  return undefined
}

function readString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim() !== '') return value.trim()
  return undefined
}

export function parseNotificationPayload(payload: unknown): NotificationPayloadFields {
  if (!payload || typeof payload !== 'object') return {}

  const record = payload as Record<string, unknown>
  const projectId = readNumber(record.project_id ?? record.projectId)
  const projectTitle =
    readString(record.project_title) ??
    readString(record.projectTitle) ??
    readString(record.event_name) ??
    readString(record.eventName)

  return { projectId, projectTitle }
}
