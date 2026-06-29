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

/**
 * Лейблы полей audit-log. Бэк шлёт `field_name` неконсистентно: то дотированным
 * путём `<секция>.<поле>` (`primary_contact.comment`), то плоским именем
 * (`contract_number`). Ключим карту обоими вариантами, плюс есть fallback по
 * «листу» имени (часть после последней точки) в `formatGenericFieldLabel`.
 */
const GENERIC_FIELD_LABELS: Record<string, string> = {
  // Менеджер проекта
  mag_manager: 'менеджер проекта',
  mag_manager_id: 'менеджер проекта',
  // plum_request
  'plum_request.comment': 'комментарий менеджера',
  mag_comment: 'комментарий менеджера',
  // primary_contact
  'primary_contact.comment': 'комментарий по контакту',
  contact_comment: 'комментарий по контакту',
  'primary_contact.contact_channel': 'канал контакта',
  contact_channel: 'канал контакта',
  // calculation
  'calculation.comment': 'комментарий к расчёту',
  calculation_comment: 'комментарий к расчёту',
  // contract
  'contract.contract_type': 'тип договора',
  contract_type: 'тип договора',
  'contract.contract_number': 'номер договора',
  contract_number: 'номер договора',
  'contract.contract_date': 'дата договора',
  contract_date: 'дата договора',
  'contract.legal_entity': 'юрлицо',
  legal_entity: 'юрлицо',
  'contract.comment': 'комментарий по договору',
  'contract.contract_comment': 'комментарий по договору',
  contract_comment: 'комментарий по договору',
  // ready_to_event / экономика
  tax_rate: 'налог',
  'economics.tax_rate': 'налог',
  // event_held
  'event_held.comment': 'комментарий после мероприятия',
  'event_held.post_event_comment': 'комментарий после мероприятия',
  post_event_comment: 'комментарий после мероприятия',
  // expenses_entered
  'expenses.comment': 'комментарий к расходам',
  expenses_comment: 'комментарий к расходам',
  // bonus
  approved_bonus: 'итоговый бонус',
  adjustment_reason: 'причина корректировки бонуса',
  bonus_adjustment_reason: 'причина корректировки бонуса',
  // out_of_mag
  reason: 'причина',
}

/**
 * Перевод enum-значений полей в логе. Ключ — «лист» имени поля (часть после
 * последней точки), значение — карта код → подпись. Совпадает с `options` в
 * `STAGE_FIELDS`, но держим локально: entities не импортирует из widgets (FSD).
 */
const FIELD_VALUE_LABELS: Record<string, Record<string, string>> = {
  contact_channel: {
    messenger: 'Мессенджер',
    phone: 'Звонок',
    meeting: 'Встреча',
  },
  contract_type: {
    with_vat: 'С НДС',
    without_vat: 'Без НДС',
  },
  data_confirmed_status: {
    confirmed: 'Данные подтверждены',
    rejected: 'Не приняты',
  },
  reason: {
    event_cancelled: 'Отмена мероприятия',
    other_rental: 'Работает другой прокат',
    no_equipment: 'Без оборудования',
  },
}

/** «Лист» дотированного имени поля: `primary_contact.comment` → `comment`. */
function fieldLeaf(fieldName: string): string {
  const dot = fieldName.lastIndexOf('.')
  return dot === -1 ? fieldName : fieldName.slice(dot + 1)
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
  const exact = GENERIC_FIELD_LABELS[fieldName]
  if (exact) return exact
  const leaf = fieldLeaf(fieldName)
  return GENERIC_FIELD_LABELS[leaf] ?? leaf
}

/** Подпись enum-значения поля (по «листу» имени); если поле не enum — значение как есть. */
export function formatGenericFieldValue(fieldName: string, value: string): string {
  const labels = FIELD_VALUE_LABELS[fieldLeaf(fieldName)]
  if (!labels) return value
  return labels[value.trim()] ?? value
}

export function resolveManagerName(raw: string, ctx?: AuditLogFormatContext): string {
  const trimmed = raw.trim()
  if (!trimmed) return trimmed

  const id = Number(trimmed)
  if (!Number.isFinite(id)) return trimmed

  return ctx?.managerNameById?.get(id) ?? `ID ${id}`
}
