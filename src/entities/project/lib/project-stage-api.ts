import type { ProjectStageEnumKey } from '@/shared/api/generated/types/Project'

import type { ProjectStage } from '../model/types'
import { CLOSING_STAGE_TO_API } from './closing-stage-api'
import { PREPROJECT_STAGE_TO_API } from './preproject-stage-api'

const PROJECT_STAGE_TO_API: Record<ProjectStage, ProjectStageEnumKey> = {
  ...PREPROJECT_STAGE_TO_API,
  ...CLOSING_STAGE_TO_API,
  out_of_mag_scope: 'out_of_mag_scope',
  archived: 'archived',
}

/** UI-стадия проекта → значение `stage` в API (для канбана и transitions). */
export function projectStageToApi(stage: ProjectStage): ProjectStageEnumKey {
  return PROJECT_STAGE_TO_API[stage]
}
