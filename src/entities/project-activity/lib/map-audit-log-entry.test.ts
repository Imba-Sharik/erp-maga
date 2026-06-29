import { describe, expect, it } from 'vitest'

import type { ProjectAuditLog } from '@/shared/api/generated/types/ProjectAuditLog'

import { mapAuditLogEntry } from './map-audit-log-entry'

function makeEntry(overrides: Partial<ProjectAuditLog>): ProjectAuditLog {
  return {
    id: 1,
    created_at: '2026-05-27T15:46:55.336763+03:00',
    action_type: 'field_change',
    action_label: 'Изменение поля',
    message: 'Изменение поля',
    field_name: 'tax_rate',
    old_value: '10',
    new_value: '20',
    stage: 'expenses_entered',
    source: 'user',
    metadata: null,
    user: { id: 7, full_name: 'Иван Петров', role: 'lead', frontend_role: 'director' },
    ...overrides,
  }
}

describe('mapAuditLogEntry', () => {
  it('прокидывает роль автора из frontend_role', () => {
    const event = mapAuditLogEntry(makeEntry({}))
    expect(event.actorRole).toBe('director')
    expect(event.actorName).toBe('Иван Петров')
  })

  it('игнорирует нераспознанный frontend_role', () => {
    const event = mapAuditLogEntry(
      makeEntry({ user: { id: 7, full_name: 'Иван Петров', role: 'lead', frontend_role: 'lead' } }),
    )
    expect(event.actorRole).toBeUndefined()
  })

  it('без пользователя роль не выставляется', () => {
    const event = mapAuditLogEntry(makeEntry({ user: null, source: 'system' }))
    expect(event.actorRole).toBeUndefined()
    expect(event.actorName).toBe('Система')
  })
})
