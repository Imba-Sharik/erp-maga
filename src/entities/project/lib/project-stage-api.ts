import type { StageEnum } from '@/shared/api/generated/types/StageEnum'

import type { ProjectStage } from '../model/types'
import { CLOSING_STAGE_TO_API } from './closing-stage-api'
import { PREPROJECT_STAGE_TO_API } from './preproject-stage-api'

const PROJECT_STAGE_TO_API: Record<ProjectStage, StageEnum> = {
  ...PREPROJECT_STAGE_TO_API,
  ...CLOSING_STAGE_TO_API,
}

/** UI-стадия проекта → значение `stage` в API (для канбана и transitions). */
export function projectStageToApi(stage: ProjectStage): StageEnum {
  return PROJECT_STAGE_TO_API[stage]
}
