import type { ProjectStageEnumKey } from '@/shared/api/generated/types/Project'

import type { ClosingStage } from '../model/types'

/** Значения `stage` в API для воронки закрытия. */
export const CLOSING_STAGE_TO_API: Record<ClosingStage, ProjectStageEnumKey> = {
  event_held: 'event_held',
  expenses_entered: 'expenses_entered',
  documents_confirmed: 'documents_confirmed',
  data_confirmed: 'data_confirmed',
  bonus_calculated: 'bonus_calculated',
  bonus_approved: 'bonus_approved',
  closed: 'closed',
}

export function closingStageToApi(stage: ClosingStage): ProjectStageEnumKey {
  return CLOSING_STAGE_TO_API[stage]
}
