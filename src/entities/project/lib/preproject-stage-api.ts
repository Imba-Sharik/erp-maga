import type { StageEnum } from '@/shared/api/generated/types/StageEnum'

import type { PreprojectStage } from '../model/types'

/** Значения `stage` в API для предпроектной воронки (см. `STAGE_MAP` в from-backend). */
export const PREPROJECT_STAGE_TO_API: Record<PreprojectStage, StageEnum> = {
  plum_request: 'plum_request',
  primary_contact_done: 'primary_contact_done',
  calculation_prepared: 'calculation_prepared',
  contract_signed: 'contract_signed',
  ready_to_event: 'ready_to_event',
}

export function preprojectStageToApi(stage: PreprojectStage): StageEnum {
  return PREPROJECT_STAGE_TO_API[stage]
}
