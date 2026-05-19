import type { StageEnum } from '@/shared/api/generated/types/StageEnum'

import type { ClosingStage } from '../model/types'

/** Значения `stage` в API для воронки закрытия. */
export const CLOSING_STAGE_TO_API: Record<ClosingStage, StageEnum> = {
  event_held: 'event_held',
  expenses_entered: 'expenses_entered',
  documents_confirmed: 'documents_confirmed',
  data_confirmed: 'data_confirmed',
  bonus_calculated: 'bonus_calculated',
  bonus_approved: 'bonus_approved',
  closed: 'closed',
}

export function closingStageToApi(stage: ClosingStage): StageEnum {
  return CLOSING_STAGE_TO_API[stage]
}
