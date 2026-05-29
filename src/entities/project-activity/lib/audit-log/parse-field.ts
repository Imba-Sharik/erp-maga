import { documentTypeFromAuditField } from './document-labels'
import type { ParsedAuditField } from './types'

const MAG_MANAGER_FIELDS = new Set(['mag_manager', 'mag_manager_id'])

export function parseAuditField(fieldName: string): ParsedAuditField {
  const trimmed = fieldName.trim()
  if (!trimmed) return { kind: 'generic', name: 'поле' }
  if (trimmed === 'stage') return { kind: 'stage' }
  if (MAG_MANAGER_FIELDS.has(trimmed)) return { kind: 'mag_manager' }

  const documentType = documentTypeFromAuditField(trimmed)
  if (documentType) return { kind: 'document_status', documentType }

  return { kind: 'generic', name: trimmed }
}
