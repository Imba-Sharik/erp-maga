import type { ProjectStageEnumKey } from '@/shared/api/generated/types/Project'

import type { PreprojectStage } from '../model/types'

/** Значения `stage` в API для предпроектной воронки (см. `STAGE_MAP` в from-backend). */
export const PREPROJECT_STAGE_TO_API: Record<PreprojectStage, ProjectStageEnumKey> = {
  plum_request: 'plum_request',
  primary_contact_done: 'primary_contact_done',
  calculation_prepared: 'calculation_prepared',
  contract_signed: 'contract_signed',
  ready_to_event: 'ready_to_event',
}

export function preprojectStageToApi(stage: PreprojectStage): ProjectStageEnumKey {
  return PREPROJECT_STAGE_TO_API[stage]
}
