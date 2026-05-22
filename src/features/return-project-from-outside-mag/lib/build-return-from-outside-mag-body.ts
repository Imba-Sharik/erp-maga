import { preprojectStageToApi, type PreprojectStage } from '@/entities/project'
import type {
  ProjectTransitionRequest,
  ProjectTransitionRequestTargetStageEnumKey,
} from '@/shared/api/generated/types/ProjectTransitionRequest'

/** Бэк читает target_stage из вложенного payload (см. return_from_out_of_mag). */
export type ReturnFromOutsideMagTransitionRequest = Pick<ProjectTransitionRequest, 'to_stage'> & {
  to_stage: 'return_from_out_of_mag'
  payload: {
    target_stage: ProjectTransitionRequestTargetStageEnumKey
    comment?: string
  }
}

export function buildReturnFromOutsideMagBody(
  targetStage: PreprojectStage,
): ReturnFromOutsideMagTransitionRequest {
  return {
    to_stage: 'return_from_out_of_mag',
    payload: {
      target_stage: preprojectStageToApi(targetStage),
    },
  }
}
