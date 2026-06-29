import type { StageDocumentType } from '@/entities/stage-document-file'
import type { ProjectAuditLog } from '@/shared/api/generated/types/ProjectAuditLog'

import { DOCUMENT_TYPE_LABELS } from './document-labels'
import {
  formatDocumentStatusValue,
  formatGenericFieldLabel,
  formatGenericFieldValue,
  formatStageValue,
  hasAuditValue,
  resolveManagerName,
} from './format-values'
import { parseAuditField } from './parse-field'
import type { AuditLogFormatContext } from './types'

function formatStageChange(oldValue: string, newValue: string): string {
  const newLabel = formatStageValue(newValue)
  if (hasAuditValue(oldValue)) {
    const oldLabel = formatStageValue(oldValue)
    return `перевёл статус из «${oldLabel}» в «${newLabel}»`
  }
  return `перевёл статус в «${newLabel}»`
}

function formatValueTransition(
  subject: string,
  oldValue: string,
  newValue: string,
  ctx?: AuditLogFormatContext,
  formatValue: (value: string, ctx?: AuditLogFormatContext) => string = (v) => v,
): string {
  if (hasAuditValue(oldValue) && hasAuditValue(newValue)) {
    return `изменил ${subject}: «${formatValue(oldValue, ctx)}» → «${formatValue(newValue, ctx)}»`
  }
  if (hasAuditValue(newValue)) {
    return `установил ${subject}: «${formatValue(newValue, ctx)}»`
  }
  if (hasAuditValue(oldValue)) {
    return `сбросил ${subject}: было «${formatValue(oldValue, ctx)}»`
  }
  return `изменил ${subject}`
}

function formatDocumentStatusChange(
  documentType: StageDocumentType,
  oldValue: string,
  newValue: string,
): string {
  const docLabel = DOCUMENT_TYPE_LABELS[documentType]
  return formatValueTransition(
    `статус «${docLabel}»`,
    oldValue,
    newValue,
    undefined,
    formatDocumentStatusValue,
  )
}

function formatMagManagerChange(
  oldValue: string,
  newValue: string,
  ctx?: AuditLogFormatContext,
): string {
  if (hasAuditValue(oldValue) && hasAuditValue(newValue)) {
    return formatValueTransition('менеджера проекта', oldValue, newValue, ctx, resolveManagerName)
  }
  if (hasAuditValue(newValue)) {
    return `назначил менеджера «${resolveManagerName(newValue, ctx)}»`
  }
  if (hasAuditValue(oldValue)) {
    return `снял менеджера «${resolveManagerName(oldValue, ctx)}»`
  }
  return 'изменил менеджера проекта'
}

export function formatFieldChange(entry: ProjectAuditLog, ctx?: AuditLogFormatContext): string {
  const field = parseAuditField(entry.field_name)

  switch (field.kind) {
    case 'stage':
      return formatStageChange(entry.old_value, entry.new_value)
    case 'document_status':
      return formatDocumentStatusChange(field.documentType, entry.old_value, entry.new_value)
    case 'mag_manager':
      return formatMagManagerChange(entry.old_value, entry.new_value, ctx)
    case 'generic':
      return formatValueTransition(
        `«${formatGenericFieldLabel(field.name)}»`,
        entry.old_value,
        entry.new_value,
        undefined,
        (value) => formatGenericFieldValue(field.name, value),
      )
  }
}

export function formatBonusManualChange(entry: ProjectAuditLog): string {
  const fieldName = hasAuditValue(entry.field_name) ? entry.field_name : 'бонус'
  return formatValueTransition(
    `«${formatGenericFieldLabel(fieldName)}»`,
    entry.old_value,
    entry.new_value,
  )
}

export { formatStageChange }
