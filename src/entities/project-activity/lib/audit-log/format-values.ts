import { ALL_STAGE_LABELS, type ProjectStage } from '@/entities/project'
import { DOCUMENT_STATUS_LABELS } from '@/entities/project-document'

import type { AuditLogFormatContext } from './types'

/** Значения статуса документа в audit-log (бэк) и в API проекта. */
const DOCUMENT_STATUS_AUDIT_LABELS: Record<string, string> = {
  ...DOCUMENT_STATUS_LABELS,
  yes: DOCUMENT_STATUS_LABELS.present,
  no: 'Нет',
  present: DOCUMENT_STATUS_LABELS.present,
  absent: 'Нет',
  re_requested: DOCUMENT_STATUS_LABELS.re_requested,
  not_required: DOCUMENT_STATUS_LABELS.not_required,
}

const GENERIC_FIELD_LABELS: Record<string, string> = {
  mag_manager: 'менеджер проекта',
  mag_manager_id: 'менеджер проекта',
  contract_number: 'номер договора',
  contract_date: 'дата договора',
  legal_entity: 'юрлицо',
  tax_rate: 'налог',
}

export function hasAuditValue(value: string): boolean {
  return value.trim().length > 0
}

export function formatStageValue(code: string): string {
  return ALL_STAGE_LABELS[code as ProjectStage] ?? code
}

export function formatDocumentStatusValue(code: string): string {
  const normalized = code.trim()
  return DOCUMENT_STATUS_AUDIT_LABELS[normalized] ?? normalized
}

export function formatGenericFieldLabel(fieldName: string): string {
  return GENERIC_FIELD_LABELS[fieldName] ?? fieldName
}

export function resolveManagerName(raw: string, ctx?: AuditLogFormatContext): string {
  const trimmed = raw.trim()
  if (!trimmed) return trimmed

  const id = Number(trimmed)
  if (!Number.isFinite(id)) return trimmed

  return ctx?.managerNameById?.get(id) ?? `ID ${id}`
}
