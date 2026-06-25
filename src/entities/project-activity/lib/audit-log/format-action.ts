import type { ProjectAuditLog } from '@/shared/api/generated/types/ProjectAuditLog'

import { formatBonusManualChange, formatFieldChange, formatStageChange } from './formatters'
import { formatStageValue, hasAuditValue } from './format-values'
import type { AuditLogFormatContext } from './types'

/** Добавляет к фразе контекст этапа на момент действия: «… · этап «Расходы внесены»». */
function withStageSuffix(action: string, stage: ProjectAuditLog['stage']): string {
  if (!stage) return action
  return `${action} · этап «${formatStageValue(stage)}»`
}

/**
 * Человекочитаемое описание действия из полей audit-log (OpenAPI §28):
 * action_type, action_label, field_name, old_value, new_value.
 */
export function formatAuditLogAction(entry: ProjectAuditLog, ctx?: AuditLogFormatContext): string {
  switch (entry.action_type) {
    case 'stage_change':
      if (entry.field_name === 'stage' || hasAuditValue(entry.new_value)) {
        return formatStageChange(entry.old_value, entry.new_value)
      }
      return entry.action_label

    case 'field_change':
      return withStageSuffix(formatFieldChange(entry, ctx), entry.stage)

    case 'bonus_manual_change':
      if (hasAuditValue(entry.old_value) || hasAuditValue(entry.new_value)) {
        return formatBonusManualChange(entry)
      }
      return entry.action_label

    case 'project_created':
      return 'создал проект'

    case 'plum_sync':
      return entry.action_label || 'синхронизация с PLUM'

    case 'out_of_mag':
      return 'перевёл проект во «Вне контура MAG»'

    case 'out_of_mag_return':
      return 'вернул проект из «Вне контура MAG»'

    case 'data_rejected':
      return 'отклонил данные по проекту'

    case 'data_confirmed':
      return 'подтвердил данные по проекту'

    case 'project_deleted':
      return 'удалил проект'

    case 'other':
    default:
      if (hasAuditValue(entry.old_value) && hasAuditValue(entry.new_value)) {
        return `${entry.action_label}: «${entry.old_value}» → «${entry.new_value}»`
      }
      return entry.action_label
  }
}
